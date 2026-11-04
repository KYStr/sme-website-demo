export const FIELD_LIMITS = {
  company: 100,
  name: 50,
  email: 254,
  phone: 20,
  subject: 120,
  message: 2000,
} as const

export const FIELD_KEYS = ['company', 'name', 'email', 'phone', 'subject', 'message'] as const

export type FieldKey = (typeof FIELD_KEYS)[number]

export type FieldErrorCode = 'invalid_type' | 'invalid_chars' | 'too_long' | 'required' | 'invalid_email' | 'invalid_phone'

export type InquiryFields = Record<FieldKey, string>

export type InquiryFieldErrors = Partial<Record<FieldKey, FieldErrorCode>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^0\d{1,3}-\d{3,4}-\d{3,4}$/

export function isPlainObject(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
}

export function fieldErrorMessage(field: FieldKey, code: string): string {
  switch (code) {
    case 'required':
      return '請填寫此欄位'
    case 'invalid_email':
      return '請輸入有效的 Email'
    case 'invalid_phone':
      return '請輸入有效的電話（例如 04-2000-0000）'
    case 'too_long':
      return `請縮短至 ${FIELD_LIMITS[field]} 字以內`
    case 'invalid_chars':
      return '此欄位含有不允許的字元'
    case 'invalid_type':
      return '此欄位必須是文字'
    default:
      return '請修正此欄位'
  }
}

function normalizeMessage(value: string): string {
  return value.normalize('NFC').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
}

function normalizeText(value: string): string {
  return value.normalize('NFC').trim()
}

function hasForbiddenControls(field: FieldKey, value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    const isControl = code <= 0x1f || code === 0x7f
    if (!isControl) continue
    if (field === 'message' && (code === 0x09 || code === 0x0a)) continue
    return true
  }
  return false
}

export function validateInquiry(
  input: unknown,
): { ok: true; value: InquiryFields } | { ok: false; fields: InquiryFieldErrors } {
  if (!isPlainObject(input)) {
    const fields = Object.fromEntries(FIELD_KEYS.map((key) => [key, 'invalid_type'])) as InquiryFieldErrors
    return { ok: false, fields }
  }

  const fields: InquiryFieldErrors = {}
  const value = {} as InquiryFields
  for (const key of FIELD_KEYS) {
    const raw = input[key]
    if (raw === undefined) {
      fields[key] = 'required'
      continue
    }
    if (typeof raw !== 'string') {
      fields[key] = 'invalid_type'
      continue
    }
    const normalized = key === 'message' ? normalizeMessage(raw) : normalizeText(raw)
    if (hasForbiddenControls(key, normalized)) {
      fields[key] = 'invalid_chars'
      continue
    }
    if (normalized.length > FIELD_LIMITS[key]) {
      fields[key] = 'too_long'
      continue
    }
    if (normalized.length === 0) {
      fields[key] = 'required'
      continue
    }
    if (key === 'email' && !EMAIL_PATTERN.test(normalized)) {
      fields[key] = 'invalid_email'
      continue
    }
    if (key === 'phone' && !PHONE_PATTERN.test(normalized)) {
      fields[key] = 'invalid_phone'
      continue
    }
    value[key] = normalized
  }

  if (Object.keys(fields).length > 0) return { ok: false, fields }
  return { ok: true, value }
}
