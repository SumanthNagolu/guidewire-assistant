import { Redis } from '@upstash/redis';

// Create a Redis client instance
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache utilities
export const cache = {
  // Get data from cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data as T;
    } catch (error) {
            return null;
    }
  },

  // Set data in cache
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await redis.setex(key, ttl, JSON.stringify(value));
      } else {
        await redis.set(key, JSON.stringify(value));
      }
    } catch (error) {
          }
  },

  // Delete from cache
  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
          }
  },

  // Clear pattern
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
          }
  },
};

// Common cache keys
export const cacheKeys = {
  // User data
  userProfile: (userId: string) => `user:profile:${userId}`,
  userProgress: (userId: string) => `user:progress:${userId}`,
  userStreak: (userId: string) => `user:streak:${userId}`,
  
  // Topic data
  topicList: (productId: string) => `topics:list:${productId}`,
  topicDetail: (topicId: string) => `topic:detail:${topicId}`,
  
  // Leaderboard
  leaderboard: () => 'leaderboard:global',
  leaderboardDaily: () => 'leaderboard:daily',
  
  // AI conversations
  aiConversation: (conversationId: string) => `ai:conversation:${conversationId}`,
  
  // Analytics
  analytics: (type: string, date: string) => `analytics:${type}:${date}`,
  
  // Productivity
  productivitySession: (userId: string) => `productivity:session:${userId}`,
  productivitySummary: (userId: string, type: string) => `productivity:summary:${userId}:${type}`,
};
