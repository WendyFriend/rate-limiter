import { beforeEach, describe, expect, it } from 'vitest';
import { TokenBucketRateLimiter } from '../src/TokenBucketRateLimiter.js';
import { FakeClock } from './FakeClock.js';

describe('TokenBucketRateLimiter', () => {
    const userKey = 'abc123';
    const oneMinuteMs = 60 * 1000;
    let rateLimiter: TokenBucketRateLimiter;
    let clock: FakeClock;

    beforeEach(() => {
        clock = new FakeClock();
        // burst size of 2, refills at 10 tokens per minute
        rateLimiter = new TokenBucketRateLimiter(2, 10, clock);
    });

    it('allows requests below the burst size', () => {
        expect(rateLimiter.allow(userKey)).toBe(true);
        expect(rateLimiter.allow(userKey)).toBe(true);
    });

    it('rejects requests beyond the burst size', () => {
        expect(rateLimiter.allow(userKey)).toBe(true);
        expect(rateLimiter.allow(userKey)).toBe(true);
        expect(rateLimiter.allow(userKey)).toBe(false);
    });

    it('refills tokens gradually over time', () => {
        expect(rateLimiter.allow(userKey)).toBe(true);
        expect(rateLimiter.allow(userKey)).toBe(true);
        expect(rateLimiter.allow(userKey)).toBe(false);

        clock.advance(6 * 1000); // 6 seconds
        expect(rateLimiter.allow(userKey)).toBe(true);
    });

    it("does not refill over capacity", () => {
        clock.advance(oneMinuteMs);

        expect(rateLimiter.allow(userKey)).toBe(true);
        expect(rateLimiter.allow(userKey)).toBe(true);
        expect(rateLimiter.allow(userKey)).toBe(false);

    });

    it('allows request again when tokens are added', () => {
        expect(rateLimiter.allow(userKey)).toBe(true);
        expect(rateLimiter.allow(userKey)).toBe(true);
        expect(rateLimiter.allow(userKey)).toBe(false);
        
        clock.advance(oneMinuteMs);
        expect(rateLimiter.allow(userKey)).toBe(true);
    });

    it('tracks users independently', () => {
        rateLimiter = new TokenBucketRateLimiter(1, 10, clock);

        expect(rateLimiter.allow('user1')).toBe(true);
        expect(rateLimiter.allow('user1')).toBe(false);

        expect(rateLimiter.allow('user2')).toBe(true);
    });
});
