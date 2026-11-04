export class HttpError extends Error {
  readonly status: number
  readonly code: string
  readonly fields?: Record<string, string>
  readonly headers?: Record<string, string>

  constructor(
    status: number,
    code: string,
    message: string,
    extra?: { fields?: Record<string, string>; headers?: Record<string, string> },
  ) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
    this.fields = extra?.fields
    this.headers = extra?.headers
  }
}
