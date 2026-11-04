type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const apiRoot = (() => {
  const configured = import.meta.env.VITE_API_BASE
  return typeof configured === 'string' ? configured.replace(/\/$/, '') : ''
})()

export function apiUrl(path: string): string {
  return `${apiRoot}${path}`
}

export type ApiResult =
  | { ok: true; status: number; body: unknown; headers: Headers }
  | {
      ok: false
      status: number
      code: string
      message: string
      fields?: Record<string, string>
      retryAfter?: number
    }

function stringFields(fields: JsonRecord): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string') result[key] = value
  }
  return result
}

export async function requestJson(path: string, init: RequestInit = {}, timeoutMs = 8000): Promise<ApiResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(apiUrl(path), { ...init, signal: controller.signal, cache: 'no-store' })
    const text = await response.text()
    let body: unknown = null
    if (text) {
      try {
        body = JSON.parse(text) as unknown
      } catch {
        return { ok: false, status: response.status, code: 'offline', message: '目前連不上詢價服務，表單沒有送出' }
      }
    }
    if (!response.ok) {
      const error = isRecord(body) && isRecord(body.error) ? body.error : {}
      const retryHeader = response.headers.get('retry-after')
      return {
        ok: false,
        status: response.status,
        code: typeof error.code === 'string' ? error.code : 'request_failed',
        message: typeof error.message === 'string' ? error.message : '目前連不上詢價服務，表單沒有送出',
        fields: isRecord(error.fields) ? stringFields(error.fields) : undefined,
        retryAfter: retryHeader && /^\d+$/.test(retryHeader) ? Number(retryHeader) : undefined,
      }
    }
    return { ok: true, status: response.status, body, headers: response.headers }
  } catch {
    return { ok: false, status: 0, code: 'offline', message: '目前連不上詢價服務，表單沒有送出' }
  } finally {
    clearTimeout(timer)
  }
}

export async function checkHealth(timeoutMs = 3000): Promise<{ online: true; formToken: string } | { online: false }> {
  const result = await requestJson('/api/health', { method: 'GET' }, timeoutMs)
  if (!result.ok || !isRecord(result.body)) return { online: false }
  if (result.body.status !== 'ok' || typeof result.body.formToken !== 'string') return { online: false }
  return { online: true, formToken: result.body.formToken }
}

export function isTicket(value: unknown): value is string {
  return typeof value === 'string' && /^FF-\d{4}-\d{4,}$/.test(value)
}
