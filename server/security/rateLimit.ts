export class SlidingWindow {
  private readonly hits = new Map<string, number[]>()
  private readonly limit: number
  private readonly windowMs: number
  private readonly now: () => number

  constructor(limit: number, windowMs: number, now: () => number) {
    this.limit = limit
    this.windowMs = windowMs
    this.now = now
  }

  attempt(key: string): { ok: true } | { ok: false; retryAfter: number } {
    const now = this.now()
    this.prune(now)
    const fresh = (this.hits.get(key) ?? []).filter((at) => now - at < this.windowMs)
    if (fresh.length >= this.limit) {
      this.hits.set(key, fresh)
      const retryAfter = Math.max(1, Math.ceil((fresh[0] + this.windowMs - now) / 1000))
      return { ok: false, retryAfter }
    }
    fresh.push(now)
    this.hits.set(key, fresh)
    return { ok: true }
  }

  private prune(now: number) {
    if (this.hits.size < 1000) return
    for (const [key, times] of this.hits) {
      if (times.every((at) => now - at >= this.windowMs)) this.hits.delete(key)
    }
  }
}

export function rateLimitMessage(retryAfter: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfter / 60))
  return `送出次數已達上限，約 ${minutes} 分鐘後可以再試（${retryAfter} 秒）。這筆還沒有送出`
}
