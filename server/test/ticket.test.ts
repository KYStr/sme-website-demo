import assert from 'node:assert/strict'
import { after, describe, test } from 'node:test'
import { readJson, startTestApp, type TestApp } from './harness.ts'
import { postInquiry, validBody } from './fixtures.ts'

describe('詢價編號', { concurrency: false }, () => {
  const apps: TestApp[] = []

  after(async () => {
    for (const app of apps) await app.close()
  })

  test('連號不重號，超過 9999 就自然變成五位數', async () => {
    const now = new Date('2026-08-01T01:00:00.000Z')
    const app = await startTestApp({ deps: { clock: () => now } })
    apps.push(app)

    const first = await readJson(await postInquiry(app.base, validBody({}, now)))
    const second = await readJson(await postInquiry(app.base, validBody({}, now)))
    assert.equal((first.body as { ticket: string }).ticket, 'FF-2026-0001')
    assert.equal((second.body as { ticket: string }).ticket, 'FF-2026-0002')

    app.db.prepare('UPDATE ticket_counters SET last_seq = ? WHERE year = ?').run(9999, 2026)
    const rolled = await readJson(await postInquiry(app.base, validBody({}, now)))
    assert.equal((rolled.body as { ticket: string }).ticket, 'FF-2026-10000')
    const counter = app.db.prepare('SELECT last_seq FROM ticket_counters WHERE year = ?').get(2026)
    assert.equal(Number(counter?.last_seq), 10000)
  })

  test('跨年夜以台北時間換年，隔年從 0001 重新計', async () => {
    let now = new Date('2026-12-31T15:59:59.999Z')
    const app = await startTestApp({ deps: { clock: () => now } })
    apps.push(app)

    const thisYear = await readJson(await postInquiry(app.base, validBody({}, now)))
    assert.equal((thisYear.body as { ticket: string }).ticket, 'FF-2026-0001')

    now = new Date('2026-12-31T16:00:00.000Z')
    const nextYear = await readJson(await postInquiry(app.base, validBody({}, now)))
    assert.equal((nextYear.body as { ticket: string }).ticket, 'FF-2027-0001')
    assert.equal((nextYear.body as { createdAt: string }).createdAt, '2026-12-31T16:00:00.000Z')
  })

  test('兩筆同時送出仍各拿一個編號', async () => {
    const now = new Date('2026-03-01T00:00:00.000Z')
    const app = await startTestApp({ deps: { clock: () => now } })
    apps.push(app)
    const [left, right] = await Promise.all([
      postInquiry(app.base, validBody({}, now)).then((response) => readJson(response)),
      postInquiry(app.base, validBody({}, now)).then((response) => readJson(response)),
    ])
    assert.equal(left.status, 201)
    assert.equal(right.status, 201)
    const tickets = [(left.body as { ticket: string }).ticket, (right.body as { ticket: string }).ticket].sort()
    assert.deepEqual(tickets, ['FF-2026-0001', 'FF-2026-0002'])
  })
})
