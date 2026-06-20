interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
}

export function rateLimit(key: string, options: RateLimitOptions): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { attempts: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  entry.attempts += 1;

  if (entry.attempts > options.maxAttempts) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  return { allowed: true, retryAfter: 0 };
}

export function getClientIp(req: { headers: Headers; ip?: string | null }): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return req.ip || 'unknown';
}
