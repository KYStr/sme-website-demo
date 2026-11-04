import type { IncomingMessage } from 'node:http'
import { headerValue } from './cors.ts'

function normalizeIp(ip: string): string {
  if (ip.startsWith('::ffff:')) return ip.slice('::ffff:'.length)
  return ip
}

// 預設不信任 X-Forwarded-For。任何人都能偽造這個標頭，只有反代後面且 TRUST_PROXY=1 才讀第一個位址。
export function clientIp(req: IncomingMessage, trustProxy: boolean): string {
  if (trustProxy) {
    const forwarded = headerValue(req.headers['x-forwarded-for'])
    const first = forwarded?.split(',')[0]?.trim()
    if (first) return normalizeIp(first)
  }
  return normalizeIp(req.socket.remoteAddress ?? 'unknown')
}
