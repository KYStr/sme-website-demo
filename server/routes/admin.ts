import { maskEmail, maskPhone } from '../../shared/mask.ts'
import { isInquiryStatus, STATUS_LABEL, STATUS_TRANSITIONS, type InquiryStatus } from '../../shared/status.ts'
import { isPlainObject } from '../../shared/inquiry.ts'
import { findInquiryById, queryInquiries, updateInquiryStatus, type StoredInquiry } from '../db/inquiries.ts'
import { readJsonBody } from '../http/body.ts'
import type { Handler } from '../http/context.ts'
import { requireAdmin } from '../security/adminAuth.ts'

const PAGE_SIZE = 10
const KEYWORD_LIMIT = 100

function listItem(row: StoredInquiry) {
  return {
    id: row.id,
    ticket: row.ticket,
    company: row.company,
    name: row.name,
    emailMasked: maskEmail(row.email),
    phoneMasked: maskPhone(row.phone),
    subject: row.subject,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt,
  }
}

function fullItem(row: StoredInquiry) {
  return {
    id: row.id,
    ticket: row.ticket,
    company: row.company,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt,
  }
}

function readId(raw: string | undefined): number | null {
  if (!raw || !/^[1-9]\d*$/.test(raw)) return null
  const id = Number(raw)
  return Number.isSafeInteger(id) ? id : null
}

export const listInquiries: Handler = (ctx) => {
  if (!requireAdmin(ctx)) return
  const params = ctx.url.searchParams
  const pageRaw = params.get('page')
  let page = 1
  if (pageRaw !== null && pageRaw !== '') {
    if (!/^[1-9]\d*$/.test(pageRaw)) {
      ctx.sendError(400, 'invalid_query', 'page 必須是正整數')
      return
    }
    page = Number(pageRaw)
    if (!Number.isSafeInteger(page)) {
      ctx.sendError(400, 'invalid_query', 'page 必須是正整數')
      return
    }
  }

  const statusRaw = params.get('status')
  let status: InquiryStatus | null = null
  if (statusRaw !== null && statusRaw !== '') {
    if (!isInquiryStatus(statusRaw)) {
      ctx.sendError(400, 'invalid_query', 'status 只能是 new、read 或 archived')
      return
    }
    status = statusRaw
  }

  const keywordRaw = params.get('q')
  let keyword: string | null = null
  if (keywordRaw !== null && keywordRaw.trim() !== '') {
    keyword = keywordRaw.trim()
    if (keyword.length > KEYWORD_LIMIT) {
      ctx.sendError(400, 'invalid_query', `搜尋關鍵字最長 ${KEYWORD_LIMIT} 字`)
      return
    }
  }

  const result = queryInquiries(ctx.db, { status, keyword, page, pageSize: PAGE_SIZE })
  ctx.send(200, { page, pageSize: PAGE_SIZE, total: result.total, items: result.rows.map(listItem) })
}

export const showInquiry: Handler = (ctx) => {
  if (!requireAdmin(ctx)) return
  const id = readId(ctx.params.id)
  const row = id === null ? undefined : findInquiryById(ctx.db, id)
  if (!row) {
    ctx.sendError(404, 'not_found', '找不到這筆詢問')
    return
  }
  ctx.send(200, fullItem(row))
}

export const patchInquiry: Handler = async (ctx) => {
  if (!requireAdmin(ctx)) return
  const id = readId(ctx.params.id)
  if (id === null) {
    ctx.sendError(404, 'not_found', '找不到這筆詢問')
    return
  }
  const body = await readJsonBody(ctx.req, ctx.config.bodyLimit)
  if (!body.ok) {
    ctx.sendError(body.status, body.code, body.message)
    return
  }
  if (!isPlainObject(body.value) || !isInquiryStatus(body.value.status)) {
    ctx.sendError(422, 'validation_failed', '請修正標示的欄位', { fields: { status: 'invalid_status' } })
    return
  }
  const next = body.value.status
  const current = findInquiryById(ctx.db, id)
  if (!current) {
    ctx.sendError(404, 'not_found', '找不到這筆詢問')
    return
  }
  if (current.status !== next && !STATUS_TRANSITIONS[current.status].includes(next)) {
    ctx.sendError(409, 'invalid_transition', `不能從「${STATUS_LABEL[current.status]}」改成「${STATUS_LABEL[next]}」`)
    return
  }
  if (current.status === next) {
    ctx.send(200, fullItem(current))
    return
  }
  const updated = updateInquiryStatus(ctx.db, id, current.status, next)
  if (!updated) {
    ctx.sendError(404, 'not_found', '找不到這筆詢問')
    return
  }
  if (updated.status !== next) {
    ctx.sendError(409, 'invalid_transition', '這筆詢問的狀態剛剛被改過，請重新整理')
    return
  }
  ctx.send(200, fullItem(updated))
}
