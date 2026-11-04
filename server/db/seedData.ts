import type { DatabaseSync } from 'node:sqlite'
import type { InquiryFields } from '../../shared/inquiry.ts'
import type { InquiryStatus } from '../../shared/status.ts'
import { inquiryContentHash } from './inquiries.ts'

type SeedRow = {
  ticket: string
  submissionId: string
  status: InquiryStatus
  createdAt: string
  fields: InquiryFields
}

const specialMessage = "圖面註記 <script>alert('xss')</script> 與 ' OR 1=1 -- 以及 emoji 🔩 與 &amp; 字面。"

function row(
  ticket: string,
  index: number,
  status: InquiryStatus,
  createdAt: string,
  company: string,
  message: string,
): SeedRow {
  const suffix = String(index).padStart(2, '0')
  return {
    ticket,
    submissionId: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    status,
    createdAt,
    fields: {
      company,
      name: `示範${suffix}`,
      email: `buyer${suffix}@workshop${suffix}.example`,
      phone: `04-2000-00${suffix}`,
      subject: `${company}估價（示意）`,
      message,
    },
  }
}

export const SEED_ROWS: SeedRow[] = [
  row('FF-2025-0001', 1, 'archived', '2025-12-31T15:30:00.000Z', '北嶺試作所（示意）', '軸心打樣，數量 2（示意）'),
  row('FF-2026-0001', 2, 'new', '2026-01-01T00:30:00.000Z', '南灣夾具行（示意）', '夾具板，數量 4（示意）'),
  row('FF-2026-0002', 3, 'read', '2026-03-15T02:00:00.000Z', '東勢治具室（示意）', '治具改孔，數量 1（示意）'),
  row('FF-2026-0003', 4, 'new', '2026-04-02T01:00:00.000Z', '西屯打樣社（示意）', specialMessage),
  row('FF-2026-0004', 5, 'archived', '2026-05-20T06:00:00.000Z', '太平軸心行（示意）', '軸心，數量 6（示意）'),
  row('FF-2026-0005', 6, 'read', '2026-06-18T03:30:00.000Z', '烏日法蘭社（示意）', '法蘭，數量 3（示意）'),
  row('FF-2026-0006', 7, 'new', '2026-07-07T07:07:00.000Z', '大里支架行（示意）', '支架，數量 8（示意）'),
  row('FF-2026-0007', 8, 'new', '2026-08-08T08:08:00.000Z', '霧峰軸襯社（示意）', '軸襯，數量 5（示意）'),
  row('FF-2026-0008', 9, 'read', '2026-09-09T01:09:00.000Z', '神岡治具行（示意）', '治具板，數量 2（示意）'),
  row('FF-2026-0009', 10, 'archived', '2026-10-10T02:10:00.000Z', '清水板金社（示意）', '板金，數量 7（示意）'),
  row('FF-2026-0010', 11, 'new', '2026-11-01T04:00:00.000Z', '沙鹿試作所（示意）', '打樣，數量 1（示意）'),
  row('FF-2026-0011', 12, 'new', '2026-11-03T08:00:00.000Z', '龍井打樣行（示意）', '法蘭打樣，數量 2（示意）'),
]

export function inquiryCount(db: DatabaseSync): number {
  const row = db.prepare('SELECT COUNT(*) AS total FROM inquiries').get()
  return Number(row?.total ?? 0)
}

export function seedDatabase(db: DatabaseSync): void {
  const insert = db.prepare(
    `INSERT INTO inquiries (
      ticket, submission_id, content_hash, company, contact_name, email, phone, subject, message, status, source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'seed', ?)`,
  )
  db.exec('BEGIN IMMEDIATE')
  try {
    for (const item of SEED_ROWS) {
      insert.run(
        item.ticket,
        item.submissionId,
        inquiryContentHash(item.fields),
        item.fields.company,
        item.fields.name,
        item.fields.email,
        item.fields.phone,
        item.fields.subject,
        item.fields.message,
        item.status,
        item.createdAt,
      )
    }
    db.prepare('INSERT INTO ticket_counters (year, last_seq) VALUES (?, ?)').run(2025, 1)
    db.prepare('INSERT INTO ticket_counters (year, last_seq) VALUES (?, ?)').run(2026, 11)
    db.exec('COMMIT')
  } catch (error) {
    try {
      db.exec('ROLLBACK')
    } catch {
      // 交易可能還沒開始。
    }
    throw error
  }
}
