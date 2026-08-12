import type { Clock } from './Clock.js';

export class SystemClock implements Clock {
    now(): number {
        return Date.now();
    }
}
