import type { IncomingMessage } from 'node:http'

export type JsonBody =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413 | 415; code: string; message: string }

function mediaType(contentType: string): { type: string; charset: string | null } {
  const [typePart, ...rest] = contentType.split(';')
  let charset: string | null = null
  for (const part of rest) {
    const [key, value] = part.split('=')
    if (key?.trim().toLowerCase() === 'charset') charset = value?.trim().toLowerCase() ?? null
  }
  return { type: typePart?.trim().toLowerCase() ?? '', charset }
}

export async function readJsonBody(req: IncomingMessage, limit: number): Promise<JsonBody> {
  const contentType = req.headers['content-type']
  if (typeof contentType !== 'string') {
    return { ok: false, status: 415, code: 'unsupported_media_type', message: 'Content-Type 必須是 application/json' }
  }
  const media = mediaType(contentType)
  if (media.type !== 'application/json') {
    return { ok: false, status: 415, code: 'unsupported_media_type', message: 'Content-Type 必須是 application/json' }
  }
  if (media.charset && media.charset !== 'utf-8' && media.charset !== 'utf8') {
    return { ok: false, status: 415, code: 'unsupported_media_type', message: 'JSON 本文只接受 UTF-8' }
  }

  const chunks: Buffer[] = []
  let received = 0
  let tooBig = false
  try {
    for await (const chunk of req) {
      const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
      received += buffer.length
      if (received > limit) {
        tooBig = true
        break
      }
      chunks.push(buffer)
    }
  } catch {
    if (!tooBig) return { ok: false, status: 400, code: 'invalid_body', message: '無法讀取本文' }
  }
  if (tooBig) {
    return { ok: false, status: 413, code: 'payload_too_large', message: `JSON 本文上限是 ${limit} bytes` }
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  if (raw.trim() === '') {
    return { ok: false, status: 400, code: 'invalid_json', message: '本文不是合法的 JSON' }
  }
  try {
    return { ok: true, value: JSON.parse(raw) as unknown }
  } catch {
    return { ok: false, status: 400, code: 'invalid_json', message: '本文不是合法的 JSON' }
  }
}
