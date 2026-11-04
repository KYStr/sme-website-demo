export function maskEmail(email: string): string {
  const at = email.indexOf('@')
  if (at <= 0) return '***'
  return `${email.slice(0, 1)}***@${email.slice(at + 1)}`
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `***${digits.slice(-4)}`
}
