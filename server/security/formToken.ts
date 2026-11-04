import { createHmac, timingSafeEqual } from 'node:crypto'

export const FORM_MIN_AGE_MS = 2_000
export const FORM_MAX_AGE_MS = 24 * 60 * 60 * 1000

export function issueFormToken(secret: string, issuedAt: number): string {
  const payload = String(issuedAt)
  const signature = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${signature}`
}

export function readFormToken(
  token: unknown,
  secret: string,
  now: number,
): { ok: true } | { ok: false; reason: 'invalid' | 'expired' | 'too_fast' } {
  if (typeof token !== 'string') return { ok: false, reason: 'invalid' }
  const dot = token.indexOf('.')
  if (dot <= 0) return { ok: false, reason: 'invalid' }
  const payload = token.slice(0, dot)
  const signature = token.slice(dot + 1)
  if (!/^\d+$/.test(payload) || !/^[0-9a-f]{64}$/i.test(signature)) return { ok: false, reason: 'invalid' }

  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  const actualBuffer = Buffer.from(signature, 'hex')
  const expectedBuffer = Buffer.from(expected, 'hex')
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return { ok: false, reason: 'invalid' }
  }

  const issuedAt = Number(payload)
  const age = now - issuedAt
  if (!Number.isSafeInteger(issuedAt) || age < 0 || age > FORM_MAX_AGE_MS) return { ok: false, reason: 'expired' }
  if (age < FORM_MIN_AGE_MS) return { ok: false, reason: 'too_fast' }
  return { ok: true }
}
