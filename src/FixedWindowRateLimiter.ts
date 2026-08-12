import type { Clock } from './Clock.js';
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
    private clock: Clock;
    private userWindows: Map<UserKey, WindowState>;

    /**
     * @param limit - The number of requests allowed per window size
     * @param windowSizeMs - Fixed period window size in milliseconds
     */
    constructor(limit: number, windowSizeMs: number, clock: Clock) {
        this.limit = limit;
        this.windowSizeMs = windowSizeMs;
        this.clock = clock;
        this.userWindows = new Map<UserKey, WindowState>();
    }

    /**
     * Determines whether the request with the user key is allowed.
     * @param key - User identifier
     */
    allow(key: UserKey): boolean {
        const current = this.clock.now();
        const window = this.userWindows.get(key);

        // first request from this user
        if (!window) {
            this.userWindows.set(key, {
                expiresAt: current + this.windowSizeMs,
                numberOfRequests: 1,
            });
            return true;
        }

        // if current window has expired
        if (current >= window.expiresAt) {
            this.userWindows.set(key, {
                expiresAt: current + this.windowSizeMs,
                numberOfRequests: 1,
            });
            return true;
        }

        // current window still active
        if (window.numberOfRequests >= this.limit) {
            return false;
        }

        this.userWindows.set(key, {
            expiresAt: window.expiresAt,
            numberOfRequests: window.numberOfRequests + 1,
        });

        return true;
    }
}
