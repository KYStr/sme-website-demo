import type { Handler } from '../http/context.ts'

export const health: Handler = (ctx) => {
  const time = ctx.clock().toISOString()
  try {
    ctx.db.prepare('SELECT 1 AS ok').get()
  } catch {
    ctx.send(503, { status: 'degraded', version: ctx.config.version, db: 'error', time })
    return
  }
  ctx.send(200, { status: 'ok', version: ctx.config.version, db: 'ok', time })
}
