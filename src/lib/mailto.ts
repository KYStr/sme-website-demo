import type { FieldKey } from '../../shared/inquiry.ts'

const FIELD_LINES: Array<{ key: FieldKey; label: string }> = [
  { key: 'company', label: '公司' },
  { key: 'name', label: '聯絡人' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: '電話' },
  { key: 'subject', label: '主旨' },
]

export function buildMailto(email: string, values: Record<FieldKey, string>): string {
  const subject = `詢價（示意）：${values.subject}`.slice(0, 120)
  const lines = FIELD_LINES.map((field) => `${field.label}：${values[field.key]}`)
  const body = [...lines, '', values.message, '', '（此信由瀏覽器郵件軟體送出，網站沒有代為寄送）'].join('\n')
  const href = (text: string) => `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
  const full = href(body)
  if (full.length <= 1800) return full
  return href(`${body.slice(0, 400)}\n…（內容過長，請在郵件中補完）`)
}
