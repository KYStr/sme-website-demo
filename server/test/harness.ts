import { createServer } from 'node:http'
import type { DatabaseSync } from 'node:sqlite'
import { createApp, type AppDeps } from '../app.ts'
import { loadConfig } from '../config.ts'
import { openDatabase } from '../db/open.ts'
import type { RouteDef } from '../http/router.ts'
import { readPackageVersion } from '../version.ts'

export type TestApp = {
  base: string
  db: DatabaseSync
  close: () => Promise<void>
}

export function testConfig(env: NodeJS.ProcessEnv = {}) {
  return loadConfig(
    {
      NODE_ENV: 'test',
      ADMIN_KEY: 'test-admin-key-1234',
      FORM_SECRET: 'test-form-secret-0123456789',
      DB_PATH: ':memory:',
      HOST: '127.0.0.1',
      ...env,
    },
    readPackageVersion(),
  )
}

export async function startTestApp(options: { env?: NodeJS.ProcessEnv; deps?: Partial<AppDeps>; routes?: RouteDef[] } = {}): Promise<TestApp> {
  const config = options.deps?.config ?? testConfig(options.env)
  const db = options.deps?.db ?? openDatabase(':memory:')
  const handle = createApp({
    db,
    config,
    logger: () => {},
    extraRoutes: options.routes,
    ...options.deps,
  })
  const server = createServer((req, res) => {
    void handle(req, res)
  })
  server.requestTimeout = 5_000
  server.keepAliveTimeout = 100
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve())
  })
  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('測試伺服器沒有接到 port')

  return {
    base: `http://127.0.0.1:${address.port}`,
    db,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          try {
            db.close()
          } catch {
            // 測試可能已經自己關掉。
          }
          if (error) reject(error)
          else resolve()
        })
        server.closeAllConnections()
      }),
  }
}

export async function readJson(response: Response): Promise<{ status: number; body: unknown; text: string; headers: Headers }> {
  const text = await response.text()
  let body: unknown = text
  if (text) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      body = text
    }
  }
  return { status: response.status, body, text, headers: response.headers }
}

export function assertError(body: unknown, code: string) {
  if (typeof body !== 'object' || body === null) throw new Error('回應不是 JSON 物件')
  const record = body as { error?: { code?: string; message?: string; stack?: unknown }; requestId?: string }
  if (record.error?.code !== code) throw new Error(`預期錯誤碼 ${code}，得到 ${record.error?.code}`)
  if (typeof record.error.message !== 'string' || record.error.message.length === 0) throw new Error('錯誤訊息是空的')
  if (typeof record.requestId !== 'string' || record.requestId.length === 0) throw new Error('缺少 requestId')
  if ('stack' in record.error) throw new Error('錯誤回應不該帶 stack')
}
