import { existsSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { loadConfig } from './config.ts'
import { openDatabase } from './db/open.ts'
import { inquiryCount, seedDatabase } from './db/seedData.ts'
import { readPackageVersion } from './version.ts'

export function removeDatabaseFiles(path: string) {
  for (const suffix of ['', '-wal', '-shm', '-journal']) {
    rmSync(`${path}${suffix}`, { force: true })
  }
}

function isDirectRun(): boolean {
  const entry = process.argv[1]
  if (!entry) return false
  const launched = pathToFileURL(entry).href
  if (process.platform === 'win32') return launched.toLowerCase() === import.meta.url.toLowerCase()
  return launched === import.meta.url
}

function main() {
  if (existsSync('.env')) process.loadEnvFile('.env')
  const config = loadConfig(process.env, readPackageVersion())
  if (config.dbPath === ':memory:') {
    console.error(JSON.stringify({ level: 'error', msg: 'DB_PATH 不能是 :memory:' }))
    process.exit(1)
  }
  if (process.argv.includes('--reset')) removeDatabaseFiles(config.dbPath)
  const db = openDatabase(config.dbPath)
  try {
    if (inquiryCount(db) > 0) {
      console.error(JSON.stringify({ level: 'error', msg: '資料庫已有詢問單，沒有寫入。若要重來請執行 npm run db:reset' }))
      process.exitCode = 1
      return
    }
    seedDatabase(db)
    console.log(JSON.stringify({ level: 'info', msg: '已寫入 12 筆示意詢問單' }))
  } finally {
    db.close()
  }
}

if (isDirectRun()) main()
