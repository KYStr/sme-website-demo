import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, describe, test } from 'node:test'
import { inquiryContentHash, insertInquiry, updateInquiryStatus } from '../db/inquiries.ts'
import { seedDatabase } from '../db/seedData.ts'
import { openDatabase } from '../db/open.ts'
import { assertError, readJson, startTestApp, type TestApp } from './harness.ts'

const KEY = 'test-admin-key-1234'
const auth = { authorization: `Bearer ${KEY}` }
const JUNE = new Date('2026-06-15T02:00:00.000Z')

function fields(message = '數量 1（示意）') {
  return {
    company: '北嶺試作所（示意）',
    name: '林示範',
    email: 'lin@fineform.example',
    phone: '04-2000-0000',
    subject: '軸心（示意）',
    message,
  }
}

describe('管理列表', { concurrency: false }, () => {
  const apps: TestApp[] = []

  after(async () => {
    for (const app of apps) await app.close()
  })

  test('沒金鑰、金鑰錯誤、以及沒設定金鑰', async () => {
    const app = await startTestApp()
    apps.push(app)
    const missing = await readJson(await fetch(`${app.base}/api/inquiries`))
    assert.equal(missing.status, 401)
    assertError(missing.body, 'unauthorized')
    assert.match(missing.text, /請帶入管理金鑰/)

    const wrong = await readJson(await fetch(`${app.base}/api/inquiries`, { headers: { authorization: 'Bearer wrong-admin-key' } }))
    assert.equal(wrong.status, 401)
    assert.match(wrong.text, /管理金鑰不正確/)
    assert.equal(wrong.text.includes(KEY), false)

    const disabled = await startTestApp({ env: { ADMIN_KEY: '' } })
    apps.push(disabled)
    const closed = await readJson(await fetch(`${disabled.base}/api/inquiries`, { headers: auth }))
    assert.equal(closed.status, 503)
    assertError(closed.body, 'admin_disabled')
    assert.match(closed.text, /ADMIN_KEY/)
  })

  test('同一 IP 連錯 10 次後暫停，時間窗過了才恢復', async () => {
    let now = JUNE.getTime()
    const app = await startTestApp({ deps: { clock: () => new Date(now) } })
    apps.push(app)
    for (let index = 0; index < 9; index += 1) {
      const result = await readJson(
        await fetch(`${app.base}/api/inquiries`, { headers: { authorization: 'Bearer wrong-admin-key' } }),
      )
      assert.equal(result.status, 401)
    }
    const tenth = await readJson(
      await fetch(`${app.base}/api/inquiries`, { headers: { authorization: 'Bearer wrong-admin-key' } }),
    )
    assert.equal(tenth.status, 429)
    assert.match(tenth.text, /管理金鑰錯誤次數過多/)
    assert.equal(tenth.headers.get('retry-after'), '600')
    const locked = await readJson(await fetch(`${app.base}/api/inquiries`, { headers: auth }))
    assert.equal(locked.status, 429)

    now += 10 * 60 * 1000
    const restored = await readJson(await fetch(`${app.base}/api/inquiries`, { headers: auth }))
    assert.equal(restored.status, 200)
  })

  test('列表遮罩聯絡資訊、分頁、篩選、搜尋，單筆才看得到全文', async () => {
    const app = await startTestApp()
    apps.push(app)
    seedDatabase(app.db)

    const page1 = await readJson(await fetch(`${app.base}/api/inquiries?page=1`, { headers: auth }))
    assert.equal(page1.status, 200)
    const body = page1.body as { page: number; pageSize: number; total: number; items: Array<Record<string, string>> }
    assert.equal(body.total, 12)
    assert.equal(body.pageSize, 10)
    assert.equal(body.items.length, 10)
    assert.equal(body.items[0]?.ticket, 'FF-2026-0011')
    assert.equal(body.items[0]?.emailMasked, 'b***@workshop12.example')
    assert.equal(body.items[0]?.phoneMasked, '***0012')
    assert.equal(page1.text.includes('buyer12@workshop12.example'), false)
    assert.equal('email' in (body.items[0] ?? {}), false)
    assert.equal('message' in (body.items[0] ?? {}), false)
    assert.equal(body.items[0]?.source, 'seed')

    const page2 = await readJson(await fetch(`${app.base}/api/inquiries?page=2`, { headers: auth }))
    const second = page2.body as { total: number; items: unknown[] }
    assert.equal(second.items.length, 2)
    assert.equal(second.total, 12)
    const page3 = await readJson(await fetch(`${app.base}/api/inquiries?page=3`, { headers: auth }))
    assert.equal((page3.body as { items: unknown[] }).items.length, 0)

    const badPage = await readJson(await fetch(`${app.base}/api/inquiries?page=0`, { headers: auth }))
    assert.equal(badPage.status, 400)

    const onlyNew = await readJson(await fetch(`${app.base}/api/inquiries?status=new`, { headers: auth }))
    const fresh = (onlyNew.body as { items: Array<{ status: string }> }).items
    assert.ok(fresh.length > 0)
    assert.ok(fresh.every((item) => item.status === 'new'))

    const found = await readJson(await fetch(`${app.base}/api/inquiries?q=${encodeURIComponent('<script>')}`, { headers: auth }))
    const hits = (found.body as { items: Array<{ ticket: string }> }).items
    assert.deepEqual(hits.map((item) => item.ticket), ['FF-2026-0003'])

    const percent = await readJson(await fetch(`${app.base}/api/inquiries?q=${encodeURIComponent('%')}`, { headers: auth }))
    assert.equal((percent.body as { total: number }).total, 0)
    const underscore = await readJson(await fetch(`${app.base}/api/inquiries?q=${encodeURIComponent('_')}`, { headers: auth }))
    assert.equal((underscore.body as { total: number }).total, 0)
    const injection = await readJson(
      await fetch(`${app.base}/api/inquiries?q=${encodeURIComponent("' OR 1=1 --")}`, { headers: auth }),
    )
    assert.equal((injection.body as { total: number }).total, 1)

    const listed = await readJson(await fetch(`${app.base}/api/inquiries?q=${encodeURIComponent('西屯')}`, { headers: auth }))
    const id = (listed.body as { items: Array<{ id: number; status: string }> }).items[0]?.id
    assert.equal(typeof id, 'number')
    const full = await readJson(await fetch(`${app.base}/api/inquiries/${id}`, { headers: auth }))
    const one = full.body as { email: string; message: string; status: string }
    assert.equal(one.email, 'buyer04@workshop04.example')
    assert.match(one.message, /<script>alert\('xss'\)<\/script>/)
    assert.equal(one.status, 'new')
    const again = await readJson(await fetch(`${app.base}/api/inquiries/${id}`, { headers: auth }))
    assert.equal((again.body as { status: string }).status, 'new')

    const missing = await readJson(await fetch(`${app.base}/api/inquiries/9999`, { headers: auth }))
    assert.equal(missing.status, 404)
    const removed = await readJson(await fetch(`${app.base}/api/inquiries/${id}`, { method: 'DELETE', headers: auth }))
    assert.equal(removed.status, 405)
    assert.equal(removed.headers.get('allow'), 'GET, PATCH')
  })

  test('狀態只能照允許的方向改，過期的狀態條件不會覆寫', async () => {
    const app = await startTestApp()
    apps.push(app)
    seedDatabase(app.db)
    const listed = await readJson(await fetch(`${app.base}/api/inquiries?q=${encodeURIComponent('龍井')}`, { headers: auth }))
    const id = (listed.body as { items: Array<{ id: number }> }).items[0]?.id
    assert.equal(typeof id, 'number')

    const read = await readJson(
      await fetch(`${app.base}/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { ...auth, 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
      }),
    )
    assert.equal(read.status, 200)
    assert.equal((read.body as { status: string }).status, 'read')

    const back = await readJson(
      await fetch(`${app.base}/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { ...auth, 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'new' }),
      }),
    )
    assert.equal(back.status, 409)
    assertError(back.body, 'invalid_transition')

    const same = await readJson(
      await fetch(`${app.base}/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { ...auth, 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
      }),
    )
    assert.equal(same.status, 200)

    const archived = await readJson(
      await fetch(`${app.base}/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { ...auth, 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      }),
    )
    assert.equal(archived.status, 200)
    const reopen = await readJson(
      await fetch(`${app.base}/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { ...auth, 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
      }),
    )
    assert.equal(reopen.status, 200)
    assert.equal((reopen.body as { status: string }).status, 'read')

    const untouched = updateInquiryStatus(app.db, id ?? 0, 'new', 'archived')
    assert.equal(untouched?.status, 'read')
  })

  test('同一時間的兩筆以較新的 id 排前面', async () => {
    const app = await startTestApp()
    apps.push(app)
    const createdAt = new Date('2026-12-01T00:00:00.000Z')
    const first = insertInquiry(app.db, {
      submissionId: randomUUID(),
      contentHash: inquiryContentHash(fields('先寫+（示意）')),
      fields: fields('先寫入（示意）'),
      createdAt,
    })
    const second = insertInquiry(app.db, {
      submissionId: randomUUID(),
      contentHash: inquiryContentHash(fields('後寫入（示意）')),
      fields: fields('後寫入（示意）'),
      createdAt,
    })
    const listed = await readJson(await fetch(`${app.base}/api/inquiries`, { headers: auth }))
    const items = (listed.body as { items: Array<{ id: number; createdAt: string }> }).items
    assert.equal(items[0]?.id, second.id)
    assert.equal(items[1]?.id, first.id)
    assert.equal(items[0]?.createdAt, items[1]?.createdAt)
  })
})

test('seed 拒絕覆寫已有資料，db:reset 會清掉再寫 12 筆', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ff-seed-'))
  const dbPath = join(dir, 'nested', 'inquiries.db')
  const run = (reset = false) =>
    spawnSync(
      process.execPath,
      ['--disable-warning=ExperimentalWarning', 'server/seed.ts', ...(reset ? ['--reset'] : [])],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: {
          ...process.env,
          DB_PATH: dbPath,
          ADMIN_KEY: 'example-only-not-a-secret',
          FORM_SECRET: 'example-only-not-a-secret',
        },
      },
    )
  try {
    const first = run()
    assert.equal(first.status, 0, first.stderr)
    const second = run()
    assert.equal(second.status, 1)
    assert.match(second.stderr, /db:reset/)
    const reset = run(true)
    assert.equal(reset.status, 0, reset.stderr)
    const db = openDatabase(dbPath)
    try {
      const total = db.prepare('SELECT COUNT(*) AS total FROM inquiries').get()
      assert.equal(Number(total?.total), 12)
      const seeded = db.prepare("SELECT COUNT(*) AS total FROM inquiries WHERE source = 'seed'").get()
      assert.equal(Number(seeded?.total), 12)
      const sample = db.prepare('SELECT email FROM inquiries LIMIT 1').get()
      assert.match(String(sample?.email), /\.example$/)
    } finally {
      db.close()
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
