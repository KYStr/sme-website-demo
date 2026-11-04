import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fieldErrorMessage } from '../../shared/inquiry.ts'
import { formatTaipei, formatTicket, taipeiYear } from '../../shared/time.ts'

test('詢價編號的年份用台北時間，跨年夜不會用 UTC 的年份', () => {
  assert.equal(taipeiYear(new Date('2026-12-31T15:59:59.999Z')), 2026)
  assert.equal(taipeiYear(new Date('2026-12-31T16:00:00.000Z')), 2027)
  assert.equal(formatTicket(2026, 1), 'FF-2026-0001')
  assert.equal(formatTicket(2026, 9999), 'FF-2026-9999')
  assert.equal(formatTicket(2026, 10000), 'FF-2026-10000')
})

test('列表用的台北時間標明時區', () => {
  assert.equal(formatTaipei('2026-11-04T12:06:00.000Z'), '2026-11-04 20:06（台北時間）')
  assert.equal(formatTaipei('2026-12-31T16:00:00.000Z'), '2027-01-01 00:00（台北時間）')
  assert.equal(formatTaipei('not-a-date'), 'not-a-date')
})

test('欄位錯誤訊息與第 1 步的前端文案相同', () => {
  assert.equal(fieldErrorMessage('company', 'required'), '請填寫此欄位')
  assert.equal(fieldErrorMessage('email', 'invalid_email'), '請輸入有效的 Email')
  assert.equal(fieldErrorMessage('phone', 'invalid_phone'), '請輸入有效的電話（例如 04-2000-0000）')
  assert.equal(fieldErrorMessage('company', 'too_long'), '請縮短至 100 字以內')
  assert.equal(fieldErrorMessage('message', 'too_long'), '請縮短至 2000 字以內')
  assert.equal(fieldErrorMessage('name', 'invalid_chars'), '此欄位含有不允許的字元')
  assert.equal(fieldErrorMessage('subject', 'invalid_type'), '此欄位必須是文字')
})
