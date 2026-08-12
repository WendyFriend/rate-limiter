import type { Clock } from './Clock.js';
import type { RateLimiter } from './RateLimiter.js';

type UserKey = string;

type UserState = {
    tokens: number;
    lastUpdateTimestamp: number;
};

const ONE_MINUTE_MS = 60 * 1000;

/**
 * Allows short bursts up to a configurable capacity while refilling 
 * tokens at a configurable rate.
 */
export class TokenBucketRateLimiter implements RateLimiter {
    private burstCapacity: number;
    private refillRate: number;
    private clock: Clock;
    private userTokens: Map<UserKey, UserState>;

    /**
     *
     * @param burstCapacity - the number of request allowed at burst
     * @param refillRate - the number of tokens added per minute
     */
    constructor(burstCapacity: number, refillRate: number, clock: Clock) {
        if (burstCapacity <= 0) {
            throw new Error('burstCapacity must be greater than 0');
        }

        if (refillRate <= 0) {
            throw new Error('refillRate must be greater than 0');
        }
        this.burstCapacity = burstCapacity;
        this.refillRate = refillRate;
        this.clock = clock;
        this.userTokens = new Map<UserKey, UserState>();
    }

    allow(userKey: UserKey): boolean {
        const current = this.clock.now();
        const userState = this.userTokens.get(userKey);
        let tokens: number;

        if (!userState) {
            // if first time
            tokens = this.burstCapacity;
        } else {
            // calculate tokens
            const elapsedTimeMs = current - userState.lastUpdateTimestamp;
            const tokensToAdd = (elapsedTimeMs / ONE_MINUTE_MS) * this.refillRate;
            tokens = Math.min(this.burstCapacity, userState.tokens + tokensToAdd);
        }

        if (tokens < 1) {
            return false;
        }

        tokens -= 1;
        this.userTokens.set(userKey, {
            tokens,
            lastUpdateTimestamp: current,
        });
        return true;
    }
}
