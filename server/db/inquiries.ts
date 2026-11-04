import { createHash } from 'node:crypto'
import type { DatabaseSync, SQLOutputValue } from 'node:sqlite'
import type { InquiryFields } from '../../shared/inquiry.ts'
import { formatTicket, taipeiYear } from '../../shared/time.ts'

export type InquiryStatus = 'new' | 'read' | 'archived'
export type InquirySource = 'web' | 'seed'

export type StoredInquiry = {
  id: number
  ticket: string
  submissionId: string
  contentHash: string
  company: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: InquiryStatus
  source: InquirySource
  createdAt: string
}

export class SubmissionConflict extends Error {
  constructor() {
    super('submission id already exists')
    this.name = 'SubmissionConflict'
  }
}

type InquiryRow = Record<string, SQLOutputValue>

export function inquiryContentHash(value: InquiryFields): string {
  const canonical = JSON.stringify([value.company, value.name, value.email, value.phone, value.subject, value.message])
  return createHash('sha256').update(canonical).digest('hex')
}

export function mapInquiry(row: InquiryRow): StoredInquiry {
  return {
    id: Number(row.id),
    ticket: String(row.ticket),
    submissionId: String(row.submission_id),
    contentHash: String(row.content_hash),
    company: String(row.company),
    name: String(row.contact_name),
    email: String(row.email),
    phone: String(row.phone),
    subject: String(row.subject),
    message: String(row.message),
    status: String(row.status) as InquiryStatus,
    source: String(row.source) as InquirySource,
    createdAt: String(row.created_at),
  }
}

export function peekNextTicket(db: DatabaseSync, now: Date): string {
  const year = taipeiYear(now)
  const counter = db.prepare('SELECT last_seq FROM ticket_counters WHERE year = ?').get(year)
  return formatTicket(year, Number(counter?.last_seq ?? 0) + 1)
}

export function findBySubmissionId(db: DatabaseSync, submissionId: string): StoredInquiry | undefined {
  const row = db.prepare('SELECT * FROM inquiries WHERE submission_id = ?').get(submissionId)
  return row ? mapInquiry(row) : undefined
}

function isOpenTransactionError(error: unknown): boolean {
  return error instanceof Error && /no transaction is active/i.test(error.message)
}

export function insertInquiry(
  db: DatabaseSync,
  input: {
    submissionId: string
    contentHash: string
    fields: InquiryFields
    createdAt: Date
    source?: InquirySource
  },
): StoredInquiry {
  const createdAt = input.createdAt.toISOString()
  const year = taipeiYear(input.createdAt)
  // 這段交易中間沒有 await。同一條連線上的下一個請求要等這段跑完；BEGIN IMMEDIATE 是多連線時的保險。
  db.exec('BEGIN IMMEDIATE')
  try {
    if (findBySubmissionId(db, input.submissionId)) throw new SubmissionConflict()

    const counter = db.prepare('SELECT last_seq FROM ticket_counters WHERE year = ?').get(year)
    const seq = Number(counter?.last_seq ?? 0) + 1
    if (counter) db.prepare('UPDATE ticket_counters SET last_seq = ? WHERE year = ?').run(seq, year)
    else db.prepare('INSERT INTO ticket_counters (year, last_seq) VALUES (?, ?)').run(year, seq)

    const ticket = formatTicket(year, seq)
    const source = input.source ?? 'web'
    const inserted = db
      .prepare(
        `INSERT INTO inquiries (
          ticket, submission_id, content_hash, company, contact_name, email, phone, subject, message, status, source, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`,
      )
      .run(
        ticket,
        input.submissionId,
        input.contentHash,
        input.fields.company,
        input.fields.name,
        input.fields.email,
        input.fields.phone,
        input.fields.subject,
        input.fields.message,
        source,
        createdAt,
      )
    db.exec('COMMIT')
    return {
      id: Number(inserted.lastInsertRowid),
      ticket,
      submissionId: input.submissionId,
      contentHash: input.contentHash,
      company: input.fields.company,
      name: input.fields.name,
      email: input.fields.email,
      phone: input.fields.phone,
      subject: input.fields.subject,
      message: input.fields.message,
      status: 'new',
      source,
      createdAt,
    }
  } catch (error) {
    try {
      db.exec('ROLLBACK')
    } catch (rollbackError) {
      if (!isOpenTransactionError(rollbackError)) throw rollbackError
    }
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed') && error.message.includes('submission_id')) {
      throw new SubmissionConflict()
    }
    throw error
  }
}
