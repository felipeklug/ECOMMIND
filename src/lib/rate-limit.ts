/**
 * Rate Limiting - Simple in-memory rate limiting
 */

interface RateLimitOptions {
  key: string;
  limit: number;
  window: number; // in milliseconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

// Simple in-memory store (in production, use Redis)
const store = new Map<string, { count: number; reset: number }>();

export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { key, limit, window } = options;
  const now = Date.now();
  
  // Clean up expired entries
  for (const [k, v] of store.entries()) {
    if (v.reset < now) {
      store.delete(k);
    }
  }
  
  const current = store.get(key);
  
  if (!current) {
    // First request
    store.set(key, { count: 1, reset: now + window });
    return {
      success: true,
      remaining: limit - 1,
      reset: now + window,
    };
  }
  
  if (current.reset < now) {
    // Window expired, reset
    store.set(key, { count: 1, reset: now + window });
    return {
      success: true,
      remaining: limit - 1,
      reset: now + window,
    };
  }
  
  if (current.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      reset: current.reset,
    };
  }
  
  // Increment count
  current.count++;
  store.set(key, current);
  
  return {
    success: true,
    remaining: limit - current.count,
    reset: current.reset,
  };
}
