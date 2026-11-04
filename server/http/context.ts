import type { IncomingMessage, ServerResponse } from 'node:http'
import type { DatabaseSync } from 'node:sqlite'
import type { Config } from '../config.ts'
import type { SlidingWindow } from '../security/rateLimit.ts'

export type ErrorExtra = {
  fields?: Record<string, string>
  headers?: Record<string, string>
}

export type RequestContext = {
  req: IncomingMessage
  res: ServerResponse
  params: Record<string, string>
  requestId: string
  config: Config
  db: DatabaseSync
  clock: () => Date
  ip: string
  url: URL
  submitLimiter: SlidingWindow
  send: (status: number, body: unknown, headers?: Record<string, string>) => void
  sendError: (status: number, code: string, message: string, extra?: ErrorExtra) => void
}

export type Handler = (ctx: RequestContext) => Promise<void> | void
