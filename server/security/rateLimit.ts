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

  blocked(key: string): { blocked: false } | { blocked: true; retryAfter: number } {
    const now = this.now()
    const fresh = this.fresh(key, now)
    if (fresh.length < this.limit) return { blocked: false }
    return { blocked: true, retryAfter: this.retryAfter(fresh[0], now) }
  }

  attempt(key: string): { ok: true } | { ok: false; retryAfter: number } {
    const now = this.now()
    this.prune(now)
    const fresh = this.fresh(key, now)
    if (fresh.length >= this.limit) return { ok: false, retryAfter: this.retryAfter(fresh[0], now) }
    fresh.push(now)
    this.hits.set(key, fresh)
    return { ok: true }
  }

  private fresh(key: string, now: number) {
    const fresh = (this.hits.get(key) ?? []).filter((at) => now - at < this.windowMs)
    if (fresh.length === 0) this.hits.delete(key)
    else this.hits.set(key, fresh)
    return fresh
  }

  private retryAfter(oldest: number, now: number) {
    return Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000))
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
