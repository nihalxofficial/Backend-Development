import { Redis } from '@upstash/redis';

// Shared Redis instance — import this wherever you need Redis
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});