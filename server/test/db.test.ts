import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { migrate } from '../db/migrations.ts'
import { openDatabase } from '../db/open.ts'

const insert = `INSERT INTO inquiries (
  ticket, submission_id, content_hash, company, contact_name, email, phone, subject, message, status, source, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

test('記憶體資料庫會建出詢價表，並擋下不合法狀態', () => {
  const db = openDatabase(':memory:')
  const version = db.prepare('PRAGMA user_version').get()
  assert.equal(Number(version?.user_version), 1)
  const foreignKeys = db.prepare('PRAGMA foreign_keys').get()
  assert.equal(Number(foreignKeys?.foreign_keys), 1)

  const names = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all()
    .map((row) => String(row.name))
  assert.ok(names.includes('inquiries'))
  assert.ok(names.includes('ticket_counters'))

  db.prepare(insert).run(
    'FF-2026-0001',
    '11111111-1111-4111-8111-111111111111',
    'hash',
    '北嶺試作所（示意）',
    '林示範',
    'lin@fineform.example',
    '04-2000-0000',
    '軸心打樣（示意）',
    '數量 2（示意）',
    'new',
    'web',
    '2026-11-04T00:00:00.000Z',
  )
  assert.throws(() => db.prepare('UPDATE inquiries SET status = ? WHERE ticket = ?').run('deleted', 'FF-2026-0001'))
  assert.throws(() =>
    db.prepare(insert).run(
      'FF-2026-0001',
      '22222222-2222-4222-8222-222222222222',
      'hash',
      '南灣夾具行（示意）',
      '陳示範',
      'chen@fineform.example',
      '04-2000-0001',
      '法蘭（示意）',
      '數量 1（示意）',
      'new',
      'web',
      '2026-11-04T00:00:00.000Z',
    ),
  )
  db.close()
})

test('檔案資料庫使用 WAL，重開後資料還在', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ff-db-'))
  try {
    const path = join(dir, 'nested', 'inquiries.db')
    const db = openDatabase(path)
    db.prepare('INSERT INTO ticket_counters (year, last_seq) VALUES (?, ?)').run(2026, 3)
    db.close()

    const again = openDatabase(path)
    const mode = again.prepare('PRAGMA journal_mode').get()
    assert.equal(String(mode?.journal_mode), 'wal')
    const row = again.prepare('SELECT last_seq FROM ticket_counters WHERE year = ?').get(2026)
    assert.equal(Number(row?.last_seq), 3)
    again.close()
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('資料庫比程式新就拒絕啟動', () => {
  const db = openDatabase(':memory:')
  db.exec('PRAGMA user_version = 99')
  assert.throws(() => migrate(db), /比這個程式新/)
  db.close()
})
