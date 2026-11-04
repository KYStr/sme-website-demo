import { isPlainObject, validateInquiry } from '../../shared/inquiry.ts'
import {
  findBySubmissionId,
  inquiryContentHash,
  insertInquiry,
  peekNextTicket,
  SubmissionConflict,
} from '../db/inquiries.ts'
import { readJsonBody } from '../http/body.ts'
import type { Handler, RequestContext } from '../http/context.ts'
import { readFormToken } from '../security/formToken.ts'
import { honeypotTripped } from '../security/honeypot.ts'
import { rateLimitMessage } from '../security/rateLimit.ts'
import { isUuid } from '../security/submissionId.ts'

const REPLAYED = { 'idempotent-replayed': 'true' }

function accepted(ticket: string, status: string, createdAt: string) {
  return { ticket, status, createdAt }
}

function settleExisting(ctx: RequestContext, submissionId: string, contentHash: string | null): boolean {
  const existing = findBySubmissionId(ctx.db, submissionId)
  if (!existing) return false
  if (contentHash !== null && contentHash === existing.contentHash) {
    ctx.send(201, accepted(existing.ticket, existing.status, existing.createdAt), REPLAYED)
    return true
  }
  ctx.sendError(409, 'submission_conflict', '這次送出的內容與先前不同，請重新整理表單後再送')
  return true
}

function pretendSuccess(ctx: RequestContext) {
  const now = ctx.clock()
  ctx.send(201, accepted(peekNextTicket(ctx.db, now), 'new', now.toISOString()))
}

export const createInquiry: Handler = async (ctx) => {
  const body = await readJsonBody(ctx.req, ctx.config.bodyLimit)
  if (!body.ok) {
    ctx.sendError(body.status, body.code, body.message)
    return
  }
  if (!isPlainObject(body.value)) {
    ctx.sendError(400, 'invalid_body', 'JSON 本文必須是物件')
    return
  }
  const submissionId = body.value.submissionId
  if (!isUuid(submissionId)) {
    ctx.sendError(422, 'validation_failed', '請修正標示的欄位', { fields: { submissionId: 'invalid_submission_id' } })
    return
  }

  const validated = validateInquiry(body.value)
  const contentHash = validated.ok ? inquiryContentHash(validated.value) : null
  if (settleExisting(ctx, submissionId, contentHash)) return

  const limit = ctx.submitLimiter.attempt(ctx.ip)
  if (!limit.ok) {
    ctx.sendError(429, 'rate_limited', rateLimitMessage(limit.retryAfter), {
      headers: { 'retry-after': String(limit.retryAfter) },
    })
    return
  }

  if (honeypotTripped(body.value.website)) {
    pretendSuccess(ctx)
    return
  }

  const token = readFormToken(body.value.formToken, ctx.config.formSecret, ctx.clock().getTime())
  if (!token.ok) {
    if (token.reason === 'too_fast') {
      pretendSuccess(ctx)
      return
    }
    ctx.sendError(422, 'form_expired', '表單已逾期，請重新整理後再送出')
    return
  }

  if (!validated.ok) {
    ctx.sendError(422, 'validation_failed', '請修正標示的欄位', { fields: validated.fields })
    return
  }

  try {
    const stored = insertInquiry(ctx.db, {
      submissionId,
      contentHash: inquiryContentHash(validated.value),
      fields: validated.value,
      createdAt: ctx.clock(),
    })
    ctx.send(201, accepted(stored.ticket, stored.status, stored.createdAt))
  } catch (error) {
    if (error instanceof SubmissionConflict && settleExisting(ctx, submissionId, contentHash)) return
    throw error
  }
}
