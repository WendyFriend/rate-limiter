import type { Clock } from "../src/Clock.js";

export class FakeClock implements Clock {
    currentTime = 0;

    now(): number {
        return this.currentTime;
    }

    advance(ms: number) {
        this.currentTime += ms;
    }
}
