import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { DatabaseSync } from 'node:sqlite'
import type { Config } from './config.ts'
import { clientIp } from './http/clientIp.ts'
import type { RequestContext } from './http/context.ts'
import { corsHeaders, headerValue, isOriginAllowed, requestOrigin } from './http/cors.ts'
import { HttpError } from './http/errors.ts'
import { type LogEntry, writeLog } from './http/logger.ts'
import { compileRoutes, type RouteDef } from './http/router.ts'
import { matchRoute } from './http/router.ts'
import { createRoutes } from './routes/index.ts'

export type AppDeps = {
  db: DatabaseSync
  config: Config
  clock?: () => Date
  logger?: (entry: LogEntry) => void
  extraRoutes?: RouteDef[]
}

type Reply = (status: number, body: unknown, headers?: Record<string, string>) => void

function declaredLength(req: IncomingMessage): number | null {
  const raw = headerValue(req.headers['content-length'])?.trim()
  if (!raw || !/^\d+$/.test(raw)) return null
  return Number(raw)
}

export function createApp(deps: AppDeps): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  const routes = compileRoutes([...createRoutes(), ...(deps.extraRoutes ?? [])])
  const clock = deps.clock ?? (() => new Date())
  const logger = deps.logger ?? writeLog

  return async function handle(req, res) {
    const started = Date.now()
    const requestId = randomUUID()
    const method = (req.method ?? 'GET').toUpperCase()
    let statusCode = 500
    let pathname = req.url?.split('?')[0] ?? '/'
    let logged = false

    const log = (level: LogEntry['level'], extra?: Partial<LogEntry>) => {
      if (level === 'info' && logged) return
      if (level === 'info') logged = true
      logger({
        level,
        time: new Date().toISOString(),
        requestId,
        method,
        path: pathname,
        status: statusCode,
        ms: Date.now() - started,
        ...extra,
      })
    }

    const origin = requestOrigin(req)
    const baseHeaders = (): Record<string, string> => ({
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'x-request-id': requestId,
      ...corsHeaders(origin, deps.config),
    })

    const reply: Reply = (status, body, headers) => {
      if (res.writableEnded) return
      statusCode = status
      const payload = JSON.stringify(body)
      res.writeHead(status, {
        ...baseHeaders(),
        'content-type': 'application/json; charset=utf-8',
        'content-length': Buffer.byteLength(payload),
        ...headers,
      })
      res.end(payload)
    }

    const sendError: RequestContext['sendError'] = (status, code, message, extra) => {
      const error: { code: string; message: string; fields?: Record<string, string> } = { code, message }
      if (extra?.fields && Object.keys(extra.fields).length > 0) error.fields = extra.fields
      reply(status, { error, requestId }, extra?.headers)
    }

    try {
      let url: URL
      try {
        url = new URL(req.url ?? '/', 'http://127.0.0.1')
      } catch {
        sendError(400, 'invalid_url', '網址無法解讀')
        return
      }
      pathname = url.pathname

      const length = declaredLength(req)
      if (length !== null && length > deps.config.bodyLimit) {
        sendError(413, 'payload_too_large', `JSON 本文上限是 ${deps.config.bodyLimit} bytes`)
        return
      }

      if (!isOriginAllowed(origin, deps.config)) {
        sendError(403, 'origin_not_allowed', '這個來源不在允許清單')
        return
      }

      if (method === 'OPTIONS') {
        if (!url.pathname.startsWith('/api/')) {
          sendError(404, 'not_found', '找不到這個路徑')
          return
        }
        statusCode = 204
        res.writeHead(204, baseHeaders())
        res.end()
        return
      }

      const match = matchRoute(routes, method, url.pathname)
      if (match.kind === 'none') {
        sendError(404, 'not_found', '找不到這個路徑')
        return
      }
      if (match.kind === 'bad-encoding') {
        sendError(400, 'invalid_url', '網址無法解讀')
        return
      }
      if (match.kind === 'method') {
        sendError(405, 'method_not_allowed', '不支援這個方法', { headers: { allow: match.allowed.join(', ') } })
        return
      }

      const ctx: RequestContext = {
        req,
        res,
        params: match.params,
        requestId,
        config: deps.config,
        db: deps.db,
        clock,
        ip: clientIp(req, deps.config.trustProxy),
        url,
        send: reply,
        sendError,
      }
      await match.handler(ctx)
      if (!res.writableEnded) sendError(500, 'internal_error', '伺服器發生錯誤')
    } catch (error) {
      if (res.writableEnded) {
        res.destroy()
        return
      }
      if (error instanceof HttpError) {
        sendError(error.status, error.code, error.message, { fields: error.fields, headers: error.headers })
        return
      }
      const message = error instanceof Error ? error.message : '伺服器發生錯誤'
      const stack = error instanceof Error ? error.stack : undefined
      log('error', { msg: message, stack, status: 500 })
      sendError(500, 'internal_error', '伺服器發生錯誤')
    } finally {
      log('info')
    }
  }
}
