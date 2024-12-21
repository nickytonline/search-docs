interface RateLimitInfo {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitInfo>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number = 10, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, info] of this.store.entries()) {
      if (now > info.resetAt) {
        this.store.delete(key);
      }
    }
  }

  check(key: string): { success: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const info = this.store.get(key);

    if (!info || now > info.resetAt) {
      // First request or window expired
      this.store.set(key, {
        count: 1,
        resetAt: now + this.windowMs
      });
      return { success: true, remaining: this.limit - 1, resetAt: now + this.windowMs };
    }

    if (info.count >= this.limit) {
      // Rate limit exceeded
      return { success: false, remaining: 0, resetAt: info.resetAt };
    }

    // Increment counter
    info.count += 1;
    this.store.set(key, info);
    return { success: true, remaining: this.limit - info.count, resetAt: info.resetAt };
  }
}

export const limiter = new RateLimiter();