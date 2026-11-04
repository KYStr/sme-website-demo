const taipeiYearFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Taipei', year: 'numeric' })
const taipeiPartsFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function taipeiYear(date: Date): number {
  return Number(taipeiYearFormat.format(date))
}

export function formatTicket(year: number, seq: number): string {
  const width = Math.max(4, String(seq).length)
  return `FF-${year}-${String(seq).padStart(width, '0')}`
}

export function formatTaipei(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const parts = taipeiPartsFormat.formatToParts(date)
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ''
  return `${pick('year')}-${pick('month')}-${pick('day')} ${pick('hour')}:${pick('minute')}（台北時間）`
}
