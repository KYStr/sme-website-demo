import type { IncomingMessage } from 'node:http'
import type { Config } from '../config.ts'

export function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

export function requestOrigin(req: IncomingMessage): string | null {
  const origin = headerValue(req.headers.origin)?.trim()
  if (!origin) return null
  return origin
}

export function isOriginAllowed(origin: string | null, config: Config): boolean {
  if (origin === null) return true
  return config.allowedOrigins.includes(origin)
}

export function corsHeaders(origin: string | null, config: Config): Record<string, string> {
  const headers: Record<string, string> = { vary: 'Origin' }
  if (origin !== null && config.allowedOrigins.includes(origin)) {
    headers['access-control-allow-origin'] = origin
    headers['access-control-allow-methods'] = 'GET, POST, PATCH, OPTIONS'
    headers['access-control-allow-headers'] = 'Content-Type, Authorization'
    headers['access-control-max-age'] = '600'
  }
  return headers
}
