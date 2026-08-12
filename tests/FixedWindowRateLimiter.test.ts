import { beforeEach, describe, expect, it } from 'vitest';
import { FixedWindowRateLimiter } from '../src/FixedWindowRateLimiter.js';
import { FakeClock } from './FakeClock.js';

describe('FixedWindowRateLimiter', () => {
    const userKey = 'abc123';
    const oneMinuteMs = 60 * 1000;
    let rateLimiter: FixedWindowRateLimiter;
    let clock: FakeClock;

    beforeEach(() => {
        clock = new FakeClock();
        // allow 100 request every 1 minute
        rateLimiter = new FixedWindowRateLimiter(100, oneMinuteMs, clock);
    });

    it('allows requests below the limit', () => {
        expect(rateLimiter.allow(userKey)).toBe(true);
    });

    it('rejects requests after the limit is reached', () => {
        // allow 2 request every 1 minute
        rateLimiter = new FixedWindowRateLimiter(2, oneMinuteMs, clock);
        expect(rateLimiter.allow(userKey)).toBe(true);
        expect(rateLimiter.allow(userKey)).toBe(true);
        expect(rateLimiter.allow(userKey)).toBe(false);
    });

    it('allows requests again after the window expires', () => {
        // allow 1 request every 1 minute
        rateLimiter = new FixedWindowRateLimiter(1, oneMinuteMs, clock);

        expect(rateLimiter.allow(userKey)).toBe(true);

        clock.advance(30 * 1000);
        expect(rateLimiter.allow(userKey)).toBe(false);

        clock.advance(30 * 1000);
        expect(rateLimiter.allow(userKey)).toBe(true);
    });

    it('tracks users independently', () => {
        // allow 1 request every 1 minute
        rateLimiter = new FixedWindowRateLimiter(1, oneMinuteMs, clock);

        expect(rateLimiter.allow('user1')).toBe(true);
        expect(rateLimiter.allow('user1')).toBe(false);
        expect(rateLimiter.allow('user2')).toBe(true);
    });
});
