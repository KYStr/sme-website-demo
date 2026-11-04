import { randomUUID } from 'node:crypto'

export function validBody(overrides: Record<string, unknown> = {}) {
  return {
    submissionId: randomUUID(),
    company: '北嶺試作所（示意）',
    name: '林示範',
    email: 'lin@fineform.example',
    phone: '04-2000-0000',
    subject: '軸心打樣（示意）',
    message: '數量 2，公差依圖（示意）',
    ...overrides,
  }
}

export function postInquiry(base: string, body: unknown) {
  return fetch(`${base}/api/inquiries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}
