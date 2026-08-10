export interface RateLimiter {
    allow(key: string): boolean;
}