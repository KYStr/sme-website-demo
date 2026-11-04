import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ConfigError, loadConfig } from '../config.ts'

const version = '0.2.0'

test('預設綁在本機、管理 API 關閉、密鑰每次現做', () => {
  const first = loadConfig({}, version)
  const second = loadConfig({}, version)
  assert.equal(first.host, '127.0.0.1')
  assert.equal(first.port, 3001)
  assert.equal(first.dbPath, 'data/inquiries.db')
  assert.equal(first.trustProxy, false)
  assert.equal(first.adminKey, null)
  assert.match(first.adminDisabledReason ?? '', /未設定 ADMIN_KEY/)
  assert.equal(first.formSecretEphemeral, true)
  assert.match(first.formSecret, /^[0-9a-f]{64}$/)
  assert.notEqual(first.formSecret, second.formSecret)
  assert.ok(first.allowedOrigins.includes('http://127.0.0.1:5173'))
  assert.ok(first.allowedOrigins.includes('http://localhost:4174'))
})

test('正式環境不自動加入開發用 origin', () => {
  const config = loadConfig({ NODE_ENV: 'production', ALLOWED_ORIGINS: 'https://fineform.example' }, version)
  assert.deepEqual(config.allowedOrigins, ['https://fineform.example'])
})

test('ADMIN_KEY 太短就停用，夠長才啟用', () => {
  const short = loadConfig({ ADMIN_KEY: 'too-short' }, version)
  assert.equal(short.adminKey, null)
  assert.match(short.adminDisabledReason ?? '', /長度不足/)

  const padded = loadConfig({ ADMIN_KEY: '   short   ' }, version)
  assert.equal(padded.adminKey, null)

  const ok = loadConfig({ ADMIN_KEY: 'example-only-not-a-secret' }, version)
  assert.equal(ok.adminKey, 'example-only-not-a-secret')
  assert.equal(ok.adminDisabledReason, null)
})

test('FORM_SECRET 有設但太短就拒絕啟動', () => {
  assert.throws(() => loadConfig({ FORM_SECRET: 'short-secret' }, version), ConfigError)
})

test('只有 TRUST_PROXY=1 才信任轉發標頭', () => {
  assert.equal(loadConfig({ TRUST_PROXY: '1' }, version).trustProxy, true)
  assert.equal(loadConfig({ TRUST_PROXY: 'true' }, version).trustProxy, false)
  assert.equal(loadConfig({ TRUST_PROXY: '0' }, version).trustProxy, false)
})

test('PORT 超出範圍或不是整數就拒絕啟動', () => {
  for (const port of ['0', '65536', 'abc', '1.5', '-1']) {
    assert.throws(() => loadConfig({ PORT: port }, version), ConfigError)
  }
  assert.equal(loadConfig({ PORT: '3010' }, version).port, 3010)
})

test('origin 會去掉空白與重複', () => {
  const config = loadConfig(
    { NODE_ENV: 'production', ALLOWED_ORIGINS: ' https://a.example ,https://a.example, https://b.example ' },
    version,
  )
  assert.deepEqual(config.allowedOrigins, ['https://a.example', 'https://b.example'])
})
