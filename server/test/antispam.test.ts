import assert from 'node:assert/strict'
import { after, describe, test } from 'node:test'
import { issueFormToken } from '../security/formToken.ts'
import { assertError, readJson, startTestApp, type TestApp } from './harness.ts'
import { agedToken, postInquiry, TEST_FORM_SECRET, validBody } from './fixtures.ts'

const JUNE = new Date('2026-06-15T02:00:00.000Z')

function countRows(app: TestApp) {
  const row = app.db.prepare('SELECT COUNT(*) AS total FROM inquiries').get()
  return Number(row?.total)
}

describe('防垃圾', { concurrency: false }, () => {
  const apps: TestApp[] = []

  after(async () => {
    for (const app of apps) await app.close()
  })

  test('蜜罐有值就回假成功，不入庫，也不告訴對方被擋下', async () => {
    const app = await startTestApp({ deps: { clock: () => JUNE } })
    apps.push(app)
    const trapped = await readJson(
      await postInquiry(app.base, validBody({ website: 'http://spam.example', email: 'not-an-email' })),
    )
    assert.equal(trapped.status, 201)
    assert.equal(trapped.headers.get('idempotent-replayed'), null)
    assert.match((trapped.body as { ticket: string }).ticket, /^FF-2026-0001$/)
    assert.equal(countRows(app), 0)

    const real = await readJson(await postInquiry(app.base, validBody({ website: '   ' })))
    assert.equal(real.status, 201)
    assert.equal((real.body as { ticket: string }).ticket, 'FF-2026-0001')
    assert.equal(countRows(app), 1)
  })

  test('表單打開不到 2 秒視為機器人；滿 2 秒就真的入庫', async () => {
    const app = await startTestApp({ deps: { clock: () => JUNE } })
    apps.push(app)
    const health = await readJson(await fetch(`${app.base}/api/health`))
    const fresh = await readJson(
      await postInquiry(app.base, validBody({ formToken: (health.body as { formToken: string }).formToken })),
    )
    assert.equal(fresh.status, 201)
    assert.equal(countRows(app), 0)

    const almost = await readJson(await postInquiry(app.base, validBody({ formToken: agedToken(JUNE, 1999) })))
    assert.equal(almost.status, 201)
    assert.equal(countRows(app), 0)

    const ready = await readJson(await postInquiry(app.base, validBody({ formToken: agedToken(JUNE, 2000) })))
    assert.equal(ready.status, 201)
    assert.equal(countRows(app), 1)
  })

  test('簽章錯誤、過期或來自未來都要求重開表單，不當成機器人吞掉', async () => {
    const app = await startTestApp({ deps: { clock: () => JUNE } })
    apps.push(app)
    const token = agedToken(JUNE)
    const flipped = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`
    const cases = [
      validBody({ formToken: flipped }),
      validBody({ formToken: agedToken(JUNE, 24 * 60 * 60 * 1000 + 1) }),
      validBody({ formToken: issueFormToken(TEST_FORM_SECRET, JUNE.getTime() + 5_000) }),
      validBody({ formToken: undefined }),
    ]
    for (const body of cases) {
      const result = await readJson(await postInquiry(app.base, body))
      assert.equal(result.status, 422)
      assertError(result.body, 'form_expired')
    }
    assert.equal(countRows(app), 0)
  })

  test('同一 IP 第 6 次被擋下，並寫明多久後可以再送；時間窗過了就恢復', async () => {
    let now = JUNE.getTime()
    const app = await startTestApp({ deps: { clock: () => new Date(now) } })
    apps.push(app)
    for (let index = 0; index < 5; index += 1) {
      const result = await readJson(await postInquiry(app.base, validBody({}, new Date(now))))
      assert.equal(result.status, 201)
    }
    const blocked = await readJson(await postInquiry(app.base, validBody({}, new Date(now))))
    assert.equal(blocked.status, 429)
    assertError(blocked.body, 'rate_limited')
    assert.equal(blocked.headers.get('retry-after'), '600')
    assert.match(blocked.text, /600 秒/)
    assert.match(blocked.text, /這筆還沒有送出/)
    assert.equal(countRows(app), 5)

    now += 10 * 60 * 1000
    const again = await readJson(await postInquiry(app.base, validBody({}, new Date(now))))
    assert.equal(again.status, 201)
    assert.equal(countRows(app), 6)
  })

  test('預設不採信 X-Forwarded-For；有開 TRUST_PROXY 才依轉發位址分開計算', async () => {
    const app = await startTestApp({ deps: { clock: () => JUNE } })
    apps.push(app)
    for (let index = 0; index < 5; index += 1) {
      const result = await readJson(
        await postInquiry(app.base, validBody(), { 'x-forwarded-for': `203.0.113.${index}` }),
      )
      assert.equal(result.status, 201)
    }
    const blocked = await readJson(await postInquiry(app.base, validBody(), { 'x-forwarded-for': '198.51.100.4' }))
    assert.equal(blocked.status, 429)

    const proxied = await startTestApp({ env: { TRUST_PROXY: '1' }, deps: { clock: () => JUNE } })
    apps.push(proxied)
    for (let index = 0; index < 5; index += 1) {
      const result = await readJson(
        await postInquiry(proxied.base, validBody(), { 'x-forwarded-for': '203.0.113.5' }),
      )
      assert.equal(result.status, 201)
    }
    const sameIp = await readJson(await postInquiry(proxied.base, validBody(), { 'x-forwarded-for': '203.0.113.5, 10.0.0.1' }))
    assert.equal(sameIp.status, 429)
    const otherIp = await readJson(await postInquiry(proxied.base, validBody(), { 'x-forwarded-for': '203.0.113.9' }))
    assert.equal(otherIp.status, 201)
  })

  test('格式錯誤與蜜罐也算進次數，重送同一筆成功的詢問不算', async () => {
    const app = await startTestApp({ deps: { clock: () => JUNE } })
    apps.push(app)
    const saved = validBody()
    assert.equal((await readJson(await postInquiry(app.base, saved))).status, 201)
    for (let index = 0; index < 10; index += 1) {
      const replay = await readJson(await postInquiry(app.base, saved))
      assert.equal(replay.status, 201)
    }
    for (let index = 0; index < 3; index += 1) {
      const invalid = await readJson(await postInquiry(app.base, validBody({ email: 'nope' })))
      assert.equal(invalid.status, 422)
    }
    const honeypot = await readJson(await postInquiry(app.base, validBody({ website: 'filled-by-bot' })))
    assert.equal(honeypot.status, 201)
    const blocked = await readJson(await postInquiry(app.base, validBody()))
    assert.equal(blocked.status, 429)
    assert.equal(countRows(app), 1)
  })
})
