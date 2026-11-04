import assert from 'node:assert/strict'
import { after, describe, test } from 'node:test'
import { assertError, readJson, startTestApp, type TestApp } from './harness.ts'
import { postInquiry, validBody } from './fixtures.ts'

const JUNE = new Date('2026-06-15T02:00:00.000Z')

describe('重複送出', { concurrency: false }, () => {
  const apps: TestApp[] = []

  after(async () => {
    for (const app of apps) await app.close()
  })

  test('相同內容重送回原編號；內容不同就拒絕，不新增第二筆', async () => {
    const app = await startTestApp({ deps: { clock: () => JUNE } })
    apps.push(app)
    const body = validBody({ company: '  北嶺試作所（示意）  ' })
    const first = await readJson(await postInquiry(app.base, body))
    assert.equal(first.status, 201)
    assert.equal(first.headers.get('idempotent-replayed'), null)

    const trimmed = { ...body, company: '北嶺試作所（示意）' }
    const replay = await readJson(await postInquiry(app.base, trimmed))
    assert.equal(replay.status, 201)
    assert.equal((replay.body as { ticket: string }).ticket, (first.body as { ticket: string }).ticket)
    assert.equal(replay.headers.get('idempotent-replayed'), 'true')

    const changed = await readJson(await postInquiry(app.base, { ...body, message: '改了數量（示意）' }))
    assert.equal(changed.status, 409)
    assertError(changed.body, 'submission_conflict')
    const count = app.db.prepare('SELECT COUNT(*) AS total FROM inquiries WHERE submission_id = ?').get(body.submissionId)
    assert.equal(Number(count?.total), 1)
  })

  test('兩筆同時用同一個識別碼，只會留下一張詢價單', async () => {
    const app = await startTestApp({ deps: { clock: () => JUNE } })
    apps.push(app)
    const body = validBody()
    const [left, right] = await Promise.all([
      postInquiry(app.base, body).then((response) => readJson(response)),
      postInquiry(app.base, body).then((response) => readJson(response)),
    ])
    assert.equal(left.status, 201)
    assert.equal(right.status, 201)
    assert.equal((left.body as { ticket: string }).ticket, (right.body as { ticket: string }).ticket)
    const replays = [left, right].filter((result) => result.headers.get('idempotent-replayed') === 'true')
    assert.equal(replays.length, 1)
    const count = app.db.prepare('SELECT COUNT(*) AS total FROM inquiries WHERE submission_id = ?').get(body.submissionId)
    assert.equal(Number(count?.total), 1)
  })
})
