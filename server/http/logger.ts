export type LogEntry = {
  level: 'info' | 'error'
  time: string
  requestId?: string
  method?: string
  path?: string
  status?: number
  ms?: number
  msg?: string
  stack?: string
}

export function writeLog(entry: LogEntry): void {
  const line = JSON.stringify(entry)
  if (entry.level === 'error') console.error(line)
  else console.log(line)
}
