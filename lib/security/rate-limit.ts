import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { logAuditEvent, getClientIP } from './audit';

// Memory-based fallback (for development)
const memoryLimiter = new RateLimiterMemory({
  points: 20, // 20 motions
  duration: 3600, // per hour
});

// Redis-based limiter (for production) - lazy initialization
let redisLimiter: RateLimiterRedis | null = null;
let redisInitialized = false;

async function initializeRedis() {
  if (redisInitialized || !process.env.REDIS_URL) {
    return;
  }
  
  try {
    const { createClient } = await import('redis');
    const redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
    
    redisLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      points: 20,
      duration: 3600,
    });
    redisInitialized = true;
  } catch {
    // Fallback to memory - already initialized
  }
}

const limiter = memoryLimiter; // Default to memory, Redis will be used if available

export async function checkRateLimit(
  userId: string,
  action: string,
  request: Request
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  // Initialize Redis if available
  await initializeRedis();
  const activeLimiter = redisLimiter || limiter;
  
  try {
    const key = `rate_limit:${userId}:${action}`;
    const res = await activeLimiter.consume(key, 1);
    
    return {
      allowed: true,
      remaining: res.remainingPoints,
      resetTime: res.msBeforeNext,
    };
  } catch (rejRes: any) {
    // Rate limit exceeded
    const ip = getClientIP(request);
    await logAuditEvent({
      user_id: userId,
      action: 'rate_limit_exceeded',
      ip_address: ip,
      metadata: { action, limit: 20, period: 'hour' },
    });

    return {
      allowed: false,
      remaining: 0,
      resetTime: rejRes.msBeforeNext || 3600000,
    };
  }
}

