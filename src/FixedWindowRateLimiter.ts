import type { RateLimiter } from './RateLimiter.js';

type WindowState = {
    expiresAt: number;
    numberOfRequests: number;
};

type UserKey = string;
/**
 * A rate limiter that allows a certain number of requests per fixed period per user.
 * Limit and window size can be configured.
 */
export class FixedWindowRateLimiter implements RateLimiter {
    private limit: number;
    private windowSizeMs: number;
    userWindows: Map<UserKey, WindowState>;

    /**
     *
     * @param limit - The number of requests allowed per window size
     * @param windowSizeMs - Fixed period window size in milliseconds
     */
    constructor(limit: number, windowSizeMs: number) {
        this.limit = limit;
        this.windowSizeMs = windowSizeMs;
        this.userWindows = new Map<UserKey, WindowState>();
    }

    /**
     * Determines whether the request with the key identifier is allowed.
     * @param key - user identifier
     */
    allow(key: string): boolean {
        const current = Date.now();
        if (!this.userWindows.has(key)) {
            this.userWindows.set(key, {
                expiresAt: current + this.windowSizeMs,
                numberOfRequests: 1,
            });
            return true;
        }

        const expiresAt = this.userWindows.get(key)?.expiresAt || 0;

        // if current window has expired
        if (expiresAt < current) {
            this.userWindows.set(key, {
                expiresAt: current + this.windowSizeMs,
                numberOfRequests: 1,
            });
            return true;
        }

        // current window has not expired
        // should not be undefined, but default to set to limit to be safe
        const numberOfRequests = this.userWindows.get(key)?.numberOfRequests || this.limit;
        if (numberOfRequests === this.limit) {
            return false;
        }

        this.userWindows.set(key, {
            expiresAt: current + this.windowSizeMs,
            numberOfRequests: numberOfRequests + 1,
        });
        return true;
    }
}
