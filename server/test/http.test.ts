import assert from 'node:assert/strict'
import { request as httpRequest } from 'node:http'
import type { DatabaseSync } from 'node:sqlite'
import { after, before, describe, test } from 'node:test'
import { BODY_LIMIT_BYTES } from '../config.ts'
import { HttpError } from '../http/errors.ts'
import type { LogEntry } from '../http/logger.ts'
import { readJsonBody } from '../http/body.ts'
import { compileRoutes, matchRoute } from '../http/router.ts'
import { assertError, readJson, startTestApp, type TestApp } from './harness.ts'

let app: TestApp
const logs: LogEntry[] = []

describe('HTTP 骨架', { concurrency: false }, () => {
before(async () => {
  app = await startTestApp({
    deps: {
      clock: () => new Date('2026-11-04T12:00:00.000Z'),
      logger: (entry) => logs.push(entry),
    },
    routes: [
      {
        method: 'POST',
        path: '/api/__test/echo',
        handler: async (ctx) => {
          const body = await readJsonBody(ctx.req, ctx.config.bodyLimit)
          if (!body.ok) {
            ctx.sendError(body.status, body.code, body.message)
            return
          }
          ctx.send(200, { received: body.value })
        },
      },
      {
        method: 'GET',
        path: '/api/__test/ip',
        handler: (ctx) => ctx.send(200, { ip: ctx.ip }),
      },
      {
        method: 'GET',
        path: '/api/__test/conflict',
        handler: () => {
          throw new HttpError(409, 'demo_conflict', '示範衝突')
        },
      },
      {
        method: 'GET',
        path: '/api/__test/boom',
        handler: () => {
          throw new Error('SECRET_STACK_NEEDLE')
        },
      },
    ],
  })
})

after(async () => {
  await app.close()
})

test('健康檢查回版本、資料庫狀態與注入的時間', async () => {
  const response = await fetch(`${app.base}/api/health`)
  const result = await readJson(response)
  assert.equal(result.status, 200)
  const body = result.body as { status: string; version: string; db: string; time: string; formToken: string }
  assert.equal(body.status, 'ok')
  assert.equal(body.version, '0.2.0')
  assert.equal(body.db, 'ok')
  assert.equal(body.time, '2026-11-04T12:00:00.000Z')
  assert.match(body.formToken, /^\d+\.[0-9a-f]{64}$/)
  assert.equal(result.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(result.headers.get('referrer-policy'), 'no-referrer')
  assert.equal(result.headers.get('cache-control'), 'no-store')
  assert.equal(result.headers.get('content-type'), 'application/json; charset=utf-8')
  assert.match(result.headers.get('x-request-id') ?? '', /^[0-9a-f-]{36}$/)
})

test('不存在的路徑回 JSON 404，不支援的方法回 405 與 Allow', async () => {
  const missing = await readJson(await fetch(`${app.base}/api/missing`))
  assert.equal(missing.status, 404)
  assertError(missing.body, 'not_found')

  const wrongMethod = await readJson(await fetch(`${app.base}/api/health`, { method: 'POST' }))
  assert.equal(wrongMethod.status, 405)
  assertError(wrongMethod.body, 'method_not_allowed')
  assert.equal(wrongMethod.headers.get('allow'), 'GET')

  const removed = await readJson(await fetch(`${app.base}/api/health`, { method: 'DELETE' }))
  assert.equal(removed.status, 405)
})

test('允許的 origin 會回 CORS，不在清單的 origin 回 403', async () => {
  const allowed = await fetch(`${app.base}/api/health`, { headers: { origin: 'http://127.0.0.1:5173' } })
  assert.equal(allowed.status, 200)
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://127.0.0.1:5173')
  assert.equal(allowed.headers.get('vary'), 'Origin')

  const preflight = await fetch(`${app.base}/api/health`, {
    method: 'OPTIONS',
    headers: { origin: 'http://127.0.0.1:5173', 'access-control-request-method': 'GET' },
  })
  assert.equal(preflight.status, 204)
  assert.equal(await preflight.text(), '')
  assert.equal(preflight.headers.get('access-control-allow-methods'), 'GET, POST, PATCH, OPTIONS')

  const blocked = await readJson(await fetch(`${app.base}/api/health`, { headers: { origin: 'https://evil.example' } }))
  assert.equal(blocked.status, 403)
  assertError(blocked.body, 'origin_not_allowed')
  assert.equal(blocked.headers.get('access-control-allow-origin'), null)
})

test('JSON 本文：型別、編碼、壞掉的 JSON、以及超過上限', async () => {
  const ok = await readJson(
    await fetch(`${app.base}/api/__test/echo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ company: '北嶺試作所（示意）' }),
    }),
  )
  assert.equal(ok.status, 200)
  assert.deepEqual(ok.body, { received: { company: '北嶺試作所（示意）' } })

  const text = await readJson(
    await fetch(`${app.base}/api/__test/echo`, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: '{}',
    }),
  )
  assert.equal(text.status, 415)
  assertError(text.body, 'unsupported_media_type')

  const patch = await readJson(
    await fetch(`${app.base}/api/__test/echo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json-patch+json' },
      body: '{}',
    }),
  )
  assert.equal(patch.status, 415)

  const utf16 = await readJson(
    await fetch(`${app.base}/api/__test/echo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-16' },
      body: '{}',
    }),
  )
  assert.equal(utf16.status, 415)

  const broken = await readJson(
    await fetch(`${app.base}/api/__test/echo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{',
    }),
  )
  assert.equal(broken.status, 400)
  assertError(broken.body, 'invalid_json')

  const empty = await readJson(
    await fetch(`${app.base}/api/__test/echo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '   ',
    }),
  )
  assert.equal(empty.status, 400)

  const tooBig = await readJson(
    await fetch(`${app.base}/api/health`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'content-length': String(BODY_LIMIT_BYTES + 1) },
      body: 'x'.repeat(BODY_LIMIT_BYTES + 1),
    }),
  )
  assert.equal(tooBig.status, 413)
  assertError(tooBig.body, 'payload_too_large')
})

test('沒有 Content-Length 時仍依實際位元組擋下過大本文', async () => {
  const url = new URL('/api/__test/echo', app.base)
  const result = await new Promise<{ status: number; text: string }>((resolve, reject) => {
    const req = httpRequest(
      { hostname: url.hostname, port: url.port, path: url.pathname, method: 'POST', headers: { 'content-type': 'application/json' } },
      (res) => {
        const parts: Buffer[] = []
        res.on('data', (chunk: Buffer) => parts.push(chunk))
        res.on('end', () => resolve({ status: res.statusCode ?? 0, text: Buffer.concat(parts).toString('utf8') }))
      },
    )
    req.on('error', reject)
    req.write('{')
    req.write('x'.repeat(BODY_LIMIT_BYTES))
    req.end()
  })
  assert.equal(result.status, 413)
  assert.match(result.text, /payload_too_large/)
})

test('預期中的 HttpError 保留狀態碼，未預期的錯誤不把 stack 回給客戶', async () => {
  const conflict = await readJson(await fetch(`${app.base}/api/__test/conflict`))
  assert.equal(conflict.status, 409)
  assertError(conflict.body, 'demo_conflict')

  logs.length = 0
  const boom = await readJson(await fetch(`${app.base}/api/__test/boom`))
  assert.equal(boom.status, 500)
  assertError(boom.body, 'internal_error')
  assert.equal(boom.text.includes('SECRET_STACK_NEEDLE'), false)
  assert.equal(boom.text.includes('stack'), false)
  const errorLog = logs.find((entry) => entry.level === 'error')
  assert.ok(errorLog)
  assert.match(errorLog.stack ?? '', /SECRET_STACK_NEEDLE/)
  const infoLog = logs.find((entry) => entry.level === 'info' && entry.path === '/api/__test/boom')
  assert.equal(infoLog?.stack, undefined)
  assert.equal(JSON.stringify(infoLog).includes('SECRET_STACK_NEEDLE'), false)
})

test('存取紀錄只留路徑，不留查詢字串與授權標頭', async () => {
  logs.length = 0
  await fetch(`${app.base}/api/health?token=super-secret`, { headers: { authorization: 'Bearer admin-secret-value' } })
  const entry = logs.find((item) => item.path === '/api/health')
  assert.ok(entry)
  const line = JSON.stringify(logs)
  assert.equal(line.includes('super-secret'), false)
  assert.equal(line.includes('admin-secret-value'), false)
  assert.equal(line.includes('Bearer'), false)
})

test('預設忽略 X-Forwarded-For', async () => {
  const response = await readJson(
    await fetch(`${app.base}/api/__test/ip`, { headers: { 'x-forwarded-for': '203.0.113.5' } }),
  )
  assert.equal(response.status, 200)
  assert.equal((response.body as { ip: string }).ip, '127.0.0.1')
})

test('壞掉的百分號編碼回 400', () => {
  const routes = compileRoutes([{ method: 'GET', path: '/api/item/:id', handler: () => undefined }])
  const match = matchRoute(routes, 'GET', '/api/item/%ZZ')
  assert.equal(match.kind, 'bad-encoding')
})

test('資料庫壞掉時健康檢查回 503，且不洩漏內部訊息', async () => {
  const broken = await startTestApp({
    deps: {
      db: {
        prepare() {
          throw new Error('disk I/O error at SECRET_DB_PATH')
        },
      } as unknown as DatabaseSync,
    },
  })
  try {
    const result = await readJson(await fetch(`${broken.base}/api/health`))
    assert.equal(result.status, 503)
    const body = result.body as { status: string; version: string; db: string; time: string }
    assert.equal(body.status, 'degraded')
    assert.equal(body.version, '0.2.0')
    assert.equal(body.db, 'error')
    assert.match(body.time, /^\d{4}-\d{2}-\d{2}T/)
    assert.deepEqual(Object.keys(body).sort(), ['db', 'status', 'time', 'version'])
    assert.equal(result.text.includes('SECRET_DB_PATH'), false)
    assert.equal(result.text.includes('disk'), false)
  } finally {
    await broken.close()
  }
})

test('TRUST_PROXY=1 時採用轉發位址的第一段', async () => {
  const proxied = await startTestApp({
    env: { TRUST_PROXY: '1' },
    routes: [{ method: 'GET', path: '/api/__test/ip', handler: (ctx) => ctx.send(200, { ip: ctx.ip }) }],
  })
  try {
    const result = await readJson(
      await fetch(`${proxied.base}/api/__test/ip`, { headers: { 'x-forwarded-for': '203.0.113.5, 10.0.0.8' } }),
    )
    assert.equal((result.body as { ip: string }).ip, '203.0.113.5')
  } finally {
    await proxied.close()
  }
})
})
