import { beforeEach, describe, expect, it } from 'vitest';
import { SlidingWindowRateLimiter } from '../src/SlidingWindowRateLimiter.js';
import { FakeClock } from './FakeClock.js';

describe('SlidingWindowRateLimiter', () => {
    const userKey = 'abc123';
    const oneMinuteMs = 60 * 1000;
    const oneSecondMs = 1 * 1000;
    let rateLimiter: SlidingWindowRateLimiter;
    let clock: FakeClock;

    beforeEach(() => {
        clock = new FakeClock();
        // allow 1 request in the last 1 minute
        rateLimiter = new SlidingWindowRateLimiter(1, oneMinuteMs, clock);
    });

    it('allows requests below the limit', () => {
        expect(rateLimiter.allow(userKey)).toBe(true);
    });

    it('rejects requests after the limit is reached', () => {
        expect(rateLimiter.allow(userKey)).toBe(true);
        expect(rateLimiter.allow(userKey)).toBe(false);
    });

    it('allows requests again after the window slides', () => {
        expect(rateLimiter.allow(userKey)).toBe(true);

        clock.advance(30 * oneSecondMs);
        expect(rateLimiter.allow(userKey)).toBe(false);

        clock.advance(30 * oneSecondMs);
        expect(rateLimiter.allow(userKey)).toBe(true);
    });

    it('prevents requests across fixed-window boundaries', () => {
        // allow 2 requests in the last minute
        rateLimiter = new SlidingWindowRateLimiter(2, oneMinuteMs, clock);
        
        clock.advance(oneMinuteMs - oneSecondMs);
        expect(rateLimiter.allow(userKey)).toBe(true);
        expect(rateLimiter.allow(userKey)).toBe(true);

        clock.advance(2 * oneSecondMs);
        expect(rateLimiter.allow(userKey)).toBe(false);
    });

    it('tracks users independently', () => {
        expect(rateLimiter.allow('user1')).toBe(true);
        expect(rateLimiter.allow('user1')).toBe(false);
        expect(rateLimiter.allow('user2')).toBe(true);
    });
});
