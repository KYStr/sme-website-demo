import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { createApp } from './app.ts'
import { ConfigError, loadConfig } from './config.ts'
import { openDatabase } from './db/open.ts'
import { readPackageVersion } from './version.ts'

export function start(env: NodeJS.ProcessEnv = process.env) {
  const config = loadConfig(env, readPackageVersion())
  if (config.formSecretEphemeral) {
    console.error(JSON.stringify({ level: 'warn', msg: 'FORM_SECRET 未設定，這次啟動使用暫時密鑰，重啟後舊的表單令牌會失效' }))
  }
  if (config.adminDisabledReason) {
    console.error(JSON.stringify({ level: 'warn', msg: config.adminDisabledReason }))
  }

  const db = openDatabase(config.dbPath)
  const handle = createApp({ db, config })
  const server = createServer((req, res) => {
    void handle(req, res)
  })
  server.requestTimeout = 10_000
  server.headersTimeout = 5_000
  server.keepAliveTimeout = 5_000

  server.listen(config.port, config.host, () => {
    console.log(JSON.stringify({ level: 'info', msg: 'listening', host: config.host, port: config.port }))
  })

  const shutdown = () => {
    server.close(() => {
      try {
        db.close()
      } catch {
        // 連線可能已經關掉。
      }
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 5_000).unref()
  }
  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)

  return { server, db, config }
}

function isDirectRun(): boolean {
  const entry = process.argv[1]
  if (!entry) return false
  const launched = pathToFileURL(entry).href
  if (process.platform === 'win32') return launched.toLowerCase() === import.meta.url.toLowerCase()
  return launched === import.meta.url
}

if (isDirectRun()) {
  if (existsSync('.env')) process.loadEnvFile('.env')
  try {
    start()
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(JSON.stringify({ level: 'error', msg: error.message }))
    } else {
      const message = error instanceof Error ? error.message : '啟動失敗'
      const stack = error instanceof Error ? error.stack : undefined
      console.error(JSON.stringify({ level: 'error', msg: message, stack }))
    }
    process.exit(1)
  }
}
