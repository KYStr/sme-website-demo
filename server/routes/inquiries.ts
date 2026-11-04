import { isPlainObject, validateInquiry } from '../../shared/inquiry.ts'
import { inquiryContentHash, insertInquiry, SubmissionConflict } from '../db/inquiries.ts'
import { readJsonBody } from '../http/body.ts'
import type { Handler } from '../http/context.ts'
import { isUuid } from '../security/submissionId.ts'

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
    ctx.send(201, { ticket: stored.ticket, status: stored.status, createdAt: stored.createdAt })
  } catch (error) {
    if (error instanceof SubmissionConflict) {
      ctx.sendError(409, 'submission_conflict', '這個送出識別碼已經有一筆詢問')
      return
    }
    throw error
  }
}
