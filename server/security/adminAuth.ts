import { createHash, timingSafeEqual } from 'node:crypto'
import type { RequestContext } from '../http/context.ts'
function lockoutMessage(retryAfter: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfter / 60))
  return `管理金鑰錯誤次數過多，約 ${minutes} 分鐘後可以再試（${retryAfter} 秒）`
}

function hash(value: string) {
  return createHash('sha256').update(value).digest()
}

export function keysMatch(provided: string, expected: string): boolean {
  const left = hash(provided)
  const right = hash(expected)
  return timingSafeEqual(left, right)
}

export function readBearer(header: string | undefined): string | null {
  if (!header) return null
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim())
  return match?.[1] ?? null
}

export function requireAdmin(ctx: RequestContext): boolean {
  if (!ctx.config.adminKey) {
    ctx.sendError(503, 'admin_disabled', ctx.config.adminDisabledReason ?? '管理列表 API 已停用')
    return false
  }

  const already = ctx.adminLimiter.blocked(ctx.ip)
  if (already.blocked) {
    ctx.sendError(429, 'rate_limited', lockoutMessage(already.retryAfter), {
      headers: { 'retry-after': String(already.retryAfter) },
    })
    return false
  }

  const header = ctx.req.headers.authorization
  const provided = readBearer(typeof header === 'string' ? header : undefined)
  if (provided !== null && keysMatch(provided, ctx.config.adminKey)) return true

  ctx.adminLimiter.attempt(ctx.ip)
  const locked = ctx.adminLimiter.blocked(ctx.ip)
  if (locked.blocked) {
    ctx.sendError(429, 'rate_limited', lockoutMessage(locked.retryAfter), {
      headers: { 'retry-after': String(locked.retryAfter) },
    })
    return false
  }

  ctx.sendError(401, 'unauthorized', provided === null ? '請帶入管理金鑰' : '管理金鑰不正確')
  return false
}
