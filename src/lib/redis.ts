import Redis from 'ioredis';

// In-memory fallback map for zero-config local development without external Redis instance
const memoryStore = new Map<string, { value: string; expiresAt: number | null }>();

class CacheManager {
  private redis: Redis | null = null;
  private isRedisAvailable = false;

  constructor() {
    if (process.env.REDIS_URL) {
      try {
        const client = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          connectTimeout: 2000,
          retryStrategy(times) {
            if (times > 2) return null;
            return Math.min(times * 100, 1000);
          },
        });

        client.connect()
          .then(() => {
            this.redis = client;
            this.isRedisAvailable = true;
            console.log('[Cache] Connected to Redis successfully');
          })
          .catch((err) => {
            console.warn('[Cache] Redis not available, using high-speed In-Memory Cache fallback:', err.message);
            this.isRedisAvailable = false;
          });
      } catch (err) {
        this.isRedisAvailable = false;
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisAvailable && this.redis) {
      try {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        console.warn(`[Cache Error] get(${key}):`, err);
      }
    }

    // In-memory fallback
    const item = memoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    return JSON.parse(item.value);
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.isRedisAvailable && this.redis) {
      try {
        if (ttlSeconds) {
          await this.redis.setex(key, ttlSeconds, serialized);
        } else {
          await this.redis.set(key, serialized);
        }
        return;
      } catch (err) {
        console.warn(`[Cache Error] set(${key}):`, err);
      }
    }

    // In-memory fallback
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    memoryStore.set(key, { value: serialized, expiresAt });
  }

  async del(key: string): Promise<void> {
    if (this.isRedisAvailable && this.redis) {
      try {
        await this.redis.del(key);
      } catch (err) {
        // ignore
      }
    }
    memoryStore.delete(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (this.isRedisAvailable && this.redis) {
      try {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch (err) {
        // ignore
      }
    }

    // In-memory regex match
    const regex = new RegExp(`^${pattern.replace('*', '.*')}`);
    const allKeys = Array.from(memoryStore.keys());
    for (const key of allKeys) {
      if (regex.test(key)) {
        memoryStore.delete(key);
      }
    }
  }
}

export const cache = new CacheManager();
