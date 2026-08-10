import { beforeEach, describe, expect, it } from 'vitest'
import { FixedWindowRateLimiter } from '../src/FixedWindowRateLimiter.js';

describe("FixedWindowRateLimiter", () => {
    let rateLimiter: FixedWindowRateLimiter;
    let userKey = "abc123";
    beforeEach(() => {
        rateLimiter = new FixedWindowRateLimiter(100, 60 * 1000)
        
    });

    it("allows requests below the limit", () => {
        // create a record for the user to expire in 60 seconds
        rateLimiter.userWindows.set(userKey, {
            expiresAt: Date.now() + 60 * 1000,
            numberOfRequests: 1
        });
        expect(rateLimiter.allow(userKey)).toEqual(true);
    });

    it("tracks users request correctly", () => {
        rateLimiter.userWindows.set(userKey, {
            expiresAt: Date.now() + 60 * 1000,
            numberOfRequests: 1
        });
        expect(rateLimiter.allow(userKey)).toEqual(true);
        expect(rateLimiter.userWindows.get(userKey)?.numberOfRequests).toEqual(2);

    })

    it("rejects requests after the limit is reached", () => {
        rateLimiter.userWindows.set(userKey, {
            expiresAt: Date.now() + 60 * 1000,
            numberOfRequests: 100
        });
        expect(rateLimiter.allow(userKey)).toEqual(false);
    });

    it("allows requests again after the window expires", () => {
        rateLimiter.userWindows.set(userKey, {
            expiresAt: Date.now() - 60 * 1000,
            numberOfRequests: 100
        });
        expect(rateLimiter.allow(userKey)).toEqual(true);
    });

    it("allows a new user", () => {
        expect(rateLimiter.allow(userKey)).toEqual(true);
    });
});