import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { BODY_LIMIT_BYTES } from '../config.ts'
import { FIELD_KEYS, FIELD_LIMITS, type FieldKey } from '../../shared/inquiry.ts'
import { assertError, readJson, startTestApp, type TestApp } from './harness.ts'
import { postInquiry, validBody } from './fixtures.ts'

const clock = new Date('2026-06-15T02:00:00.000Z')

let app: TestApp

function fieldsOf(body: unknown): Record<string, string> {
  assert.equal(typeof body, 'object')
  assert.ok(body)
  const fields = (body as { error?: { fields?: Record<string, string> } }).error?.fields
  assert.ok(fields)
  return fields
}

describe('詢價驗證', { concurrency: false }, () => {
  before(async () => {
    app = await startTestApp({ deps: { clock: () => clock } })
  })

  after(async () => {
    await app.close()
  })

  test('合法詢問回 201，內容正規化後入庫，回應不回傳內文', async () => {
    const result = await readJson(
      await postInquiry(
        app.base,
        validBody({
          company: '  e\u0301北嶺（示意）  ',
          message: '第一行\r\n第二行\t結尾  ',
        }),
      ),
    )
    assert.equal(result.status, 201)
    const body = result.body as { ticket: string; status: string; createdAt: string }
    assert.match(body.ticket, /^FF-2026-\d{4,}$/)
    assert.equal(body.status, 'new')
    assert.equal(body.createdAt, '2026-06-15T02:00:00.000Z')
    assert.deepEqual(Object.keys(body).sort(), ['createdAt', 'status', 'ticket'])

    const row = app.db.prepare('SELECT company, message FROM inquiries WHERE ticket = ?').get(body.ticket)
    assert.equal(row?.company, 'é北嶺（示意）')
    assert.equal(row?.message, '第一行\n第二行\t結尾')
  })

  test('六欄都沒填時，每一欄都回 required', async () => {
    const result = await readJson(await postInquiry(app.base, { submissionId: crypto.randomUUID() }))
    assert.equal(result.status, 422)
    assertError(result.body, 'validation_failed')
    assert.deepEqual(
      fieldsOf(result.body),
      Object.fromEntries(FIELD_KEYS.map((key) => [key, 'required'])),
    )
  })

  for (const field of FIELD_KEYS) {
    test(`${field} 的空白、超長與非字串會回到該欄`, async () => {
      const blank = await readJson(await postInquiry(app.base, validBody({ [field]: '   ' })))
      assert.equal(blank.status, 422)
      assert.equal(fieldsOf(blank.body)[field], 'required')

      const tooLong = await readJson(
        await postInquiry(app.base, validBody({ [field]: '測'.repeat(FIELD_LIMITS[field] + 1) })),
      )
      assert.equal(tooLong.status, 422)
      assert.equal(fieldsOf(tooLong.body)[field], 'too_long')

      const atLimit = validBody({ [field]: limitValue(field) })
      const accepted = await readJson(await postInquiry(app.base, atLimit))
      assert.equal(accepted.status, 201, `${field} 剛好在上限應該接受`)

      const wrongType = await readJson(await postInquiry(app.base, validBody({ [field]: 12 })))
      assert.equal(wrongType.status, 422)
      assert.equal(fieldsOf(wrongType.body)[field], 'invalid_type')
    })
  }

  test('Email 與電話沿用第 1 步的格式，壞格式只標那一欄', async () => {
    const email = await readJson(await postInquiry(app.base, validBody({ email: 'not-an-email' })))
    assert.equal(fieldsOf(email.body).email, 'invalid_email')

    const bare = await readJson(await postInquiry(app.base, validBody({ email: 'a@b' })))
    assert.equal(fieldsOf(bare.body).email, 'invalid_email')

    const padded = await readJson(await postInquiry(app.base, validBody({ email: '  lin@fineform.example  ' })))
    assert.equal(padded.status, 201)

    const phone = await readJson(await postInquiry(app.base, validBody({ phone: '12345' })))
    assert.equal(fieldsOf(phone.body).phone, 'invalid_phone')

    const international = await readJson(await postInquiry(app.base, validBody({ phone: '+886-4-2000-0000' })))
    assert.equal(fieldsOf(international.body).phone, 'invalid_phone')

    const fullwidth = await readJson(await postInquiry(app.base, validBody({ phone: '０４-2000-0000' })))
    assert.equal(fieldsOf(fullwidth.body).phone, 'invalid_phone')

    const both = await readJson(await postInquiry(app.base, validBody({ email: 'nope', phone: '12345' })))
    assert.equal(fieldsOf(both.body).email, 'invalid_email')
    assert.equal(fieldsOf(both.body).phone, 'invalid_phone')
  })

  test('控制字元會被擋下；詢問內容可以換行與定位字元', async () => {
    const company = await readJson(await postInquiry(app.base, validBody({ company: '北嶺\u0000（示意）' })))
    assert.equal(fieldsOf(company.body).company, 'invalid_chars')

    const subject = await readJson(await postInquiry(app.base, validBody({ subject: '主旨\n第二行' })))
    assert.equal(fieldsOf(subject.body).subject, 'invalid_chars')

    const message = await readJson(await postInquiry(app.base, validBody({ message: '有鈴鐺\u0007' })))
    assert.equal(fieldsOf(message.body).message, 'invalid_chars')

    const ok = await readJson(await postInquiry(app.base, validBody({ message: '第一行\n第二行\t備註' })))
    assert.equal(ok.status, 201)
  })

  test('公司名稱以 UTF-16 長度計算，50 個 emoji 可以、51 個不行', async () => {
    const ok = await readJson(await postInquiry(app.base, validBody({ company: '😀'.repeat(50) })))
    assert.equal(ok.status, 201)
    const over = await readJson(await postInquiry(app.base, validBody({ company: '😀'.repeat(51) })))
    assert.equal(fieldsOf(over.body).company, 'too_long')
  })

  test('script、SQL 片段與引號原樣入庫，資料表還在', async () => {
    const company = `'); DROP TABLE inquiries; --`
    const subject = `' OR 1=1 --`
    const message = `<script>alert('xss')</script>`
    const result = await readJson(await postInquiry(app.base, validBody({ company, subject, message })))
    assert.equal(result.status, 201)
    const ticket = (result.body as { ticket: string }).ticket
    const row = app.db.prepare('SELECT company, subject, message FROM inquiries WHERE ticket = ?').get(ticket)
    assert.equal(row?.company, company)
    assert.equal(row?.subject, subject)
    assert.equal(row?.message, message)
    const names = app.db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map((item) => String(item.name))
    assert.ok(names.includes('inquiries'))
    assert.ok(names.includes('ticket_counters'))
    assert.equal(result.text.includes('<script>'), false)
  })

  test('submissionId 不是 UUID、本文不是物件、以及過大本文', async () => {
    const missing = await readJson(await postInquiry(app.base, validBody({ submissionId: 'not-a-uuid' })))
    assert.equal(missing.status, 422)
    assert.equal(fieldsOf(missing.body).submissionId, 'invalid_submission_id')
    assert.equal('company' in fieldsOf(missing.body), false)

    const array = await readJson(await postInquiry(app.base, []))
    assert.equal(array.status, 400)
    assertError(array.body, 'invalid_body')

    const empty = await readJson(await postInquiry(app.base, null))
    assert.equal(empty.status, 400)

    const tooBig = await readJson(
      await fetch(`${app.base}/api/inquiries`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'content-length': String(BODY_LIMIT_BYTES + 1) },
        body: 'x'.repeat(BODY_LIMIT_BYTES + 1),
      }),
    )
    assert.equal(tooBig.status, 413)
    assertError(tooBig.body, 'payload_too_large')
  })

  test('同一個 submissionId 再送不會變成第二筆', async () => {
    const body = validBody()
    const first = await readJson(await postInquiry(app.base, body))
    assert.equal(first.status, 201)
    const second = await readJson(await postInquiry(app.base, body))
    assert.equal(second.status, 409)
    assertError(second.body, 'submission_conflict')
    const count = app.db.prepare('SELECT COUNT(*) AS total FROM inquiries WHERE submission_id = ?').get(body.submissionId)
    assert.equal(Number(count?.total), 1)
  })

  test('列表還沒開放時，GET 不會把資料漏出去', async () => {
    const result = await readJson(await fetch(`${app.base}/api/inquiries`))
    assert.equal(result.status, 405)
    assert.equal(result.headers.get('allow'), 'POST')
  })
})

function limitValue(field: FieldKey): string {
  if (field === 'email') return `a@${'b'.repeat(250)}.c`
  if (field === 'phone') return '0912-3456-7890'
  return '測'.repeat(FIELD_LIMITS[field])
}
