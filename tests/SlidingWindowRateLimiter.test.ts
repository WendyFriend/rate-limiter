import { beforeEach, describe, expect, it } from 'vitest';
import { SlidingWindowRateLimiter } from '../src/SlidingWindowRateLimiter.js';

describe('SlidingWindowRateLimiter', () => {
    let rateLimiter: SlidingWindowRateLimiter;
    let userKey = 'abc123';
    beforeEach(() => {
        rateLimiter = new SlidingWindowRateLimiter(100, 60 * 1000);
    });

    it('allows requests below the limit', () => {
        const timestamp = Date.now() - 1 * 1000;
        rateLimiter.userWindows.set(userKey, [timestamp]);
        expect(rateLimiter.allow(userKey)).toEqual(true);
    });

    it('tracks users request correctly', () => {
        rateLimiter.allow(userKey);
        expect(rateLimiter.userWindows.get(userKey)?.length).toEqual(1);
    });

    it('rejects requests after the limit is reached', () => {
        rateLimiter = new SlidingWindowRateLimiter(1, 60 * 1000); // allow 1 request in the last 60 seconds
        rateLimiter.allow(userKey);
        expect(rateLimiter.allow(userKey)).toEqual(false);
    });

    it('allows requests again after the window slides', async () => {
        rateLimiter = new SlidingWindowRateLimiter(1, 1 * 1000); // allow 1 request in the last 1 second
        rateLimiter.allow(userKey);
        expect(rateLimiter.allow(userKey)).toEqual(false);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1 second
        expect(rateLimiter.allow(userKey)).toEqual(true);
    });

    it('users have independent windows', () => {
        const userKey2 = 'abcd1234';
        rateLimiter.allow(userKey);
        rateLimiter.allow(userKey2);
        expect(rateLimiter.userWindows.get(userKey)?.length).toEqual(1);
        expect(rateLimiter.userWindows.get(userKey2)?.length).toEqual(1);
    });
});
