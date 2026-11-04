import type { DatabaseSync } from 'node:sqlite'

export const SCHEMA_VERSION = 1

const SCHEMA = `
CREATE TABLE inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket TEXT NOT NULL UNIQUE,
  submission_id TEXT NOT NULL UNIQUE,
  content_hash TEXT NOT NULL,
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'seed')),
  created_at TEXT NOT NULL
);
CREATE INDEX inquiries_created ON inquiries (created_at DESC, id DESC);
CREATE INDEX inquiries_status_created ON inquiries (status, created_at DESC, id DESC);
CREATE TABLE ticket_counters (
  year INTEGER PRIMARY KEY,
  last_seq INTEGER NOT NULL
);
`

export function migrate(db: DatabaseSync): void {
  const currentRow = db.prepare('PRAGMA user_version').get()
  const current = Number(currentRow?.user_version ?? 0)
  if (current > SCHEMA_VERSION) {
    throw new Error(`資料庫結構版本 ${current} 比這個程式新，拒絕啟動`)
  }
  if (current >= SCHEMA_VERSION) return

  db.exec('BEGIN IMMEDIATE')
  try {
    db.exec(SCHEMA)
    db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`)
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
