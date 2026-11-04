export const INQUIRY_STATUSES = ['new', 'read', 'archived'] as const

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

export const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: '新進',
  read: '已讀',
  archived: '已封存',
}

export const STATUS_TRANSITIONS: Record<InquiryStatus, readonly InquiryStatus[]> = {
  new: ['read', 'archived'],
  read: ['archived'],
  archived: ['read'],
}

export function isInquiryStatus(value: unknown): value is InquiryStatus {
  return typeof value === 'string' && INQUIRY_STATUSES.includes(value as InquiryStatus)
}
