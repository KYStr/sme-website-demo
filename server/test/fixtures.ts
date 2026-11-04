import { randomUUID } from 'node:crypto'
import { issueFormToken } from '../security/formToken.ts'

export const TEST_FORM_SECRET = 'test-form-secret-0123456789'

export function agedToken(now: Date, ageMs = 3000, secret = TEST_FORM_SECRET) {
  return issueFormToken(secret, now.getTime() - ageMs)
}

export function validBody(overrides: Record<string, unknown> = {}, now = new Date('2026-06-15T02:00:00.000Z')) {
  return {
    submissionId: randomUUID(),
    company: '北嶺試作所（示意）',
    name: '林示範',
    email: 'lin@fineform.example',
    phone: '04-2000-0000',
    subject: '軸心打樣（示意）',
    message: '數量 2，公差依圖（示意）',
    website: '',
    formToken: agedToken(now),
    ...overrides,
  }
}

export function postInquiry(base: string, body: unknown, headers: Record<string, string> = {}) {
  return fetch(`${base}/api/inquiries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}
