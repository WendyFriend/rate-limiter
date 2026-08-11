import type { RateLimiter } from './RateLimiter.js';

type UserKey = string;
type Timestamp = number;

/**
 * Uses a sliding-window algorithm which looks at the the window period
 * continuously rather than resetting at fixed boundaries, which gives us
 * smoother and more accurate rate limiting.
 */
export class SlidingWindowRateLimiter implements RateLimiter {
    private limit: number;
    private windowSizeMs: number;
    userWindows: Map<UserKey, Timestamp[]>;

    /**
     * @param limit - The number of requests allowed in the sliding window.
     * @param windowSizeMs - Sliding window size in milliseconds
     */
    constructor(limit: number, windowSizeMs: number) {
        this.limit = limit;
        this.windowSizeMs = windowSizeMs;
        this.userWindows = new Map<UserKey, Array<Timestamp>>();
    }

    /**
     * Determines whether the request with the user key is allowed.
     * @param userKey - user identifier
     * @returns true if allowed, false if not allowed
     */
    allow(userKey: string): boolean {
        // add user if not seen
        const current = Date.now();
        let timestamps = this.userWindows.get(userKey) ?? [];
        const windowStart = current - this.windowSizeMs;

        // remove expired timestamps
        timestamps = timestamps?.filter((t) => t >= windowStart);

        // reached limit
        if (timestamps.length >= this.limit) {
            this.userWindows.set(userKey, timestamps);
            return false;
        }

        // has not reached limit, add the current timestamp
        timestamps.push(current);
        this.userWindows.set(userKey, timestamps);
        return true;
    }
}
