# Rate Limiter

A TypeScript implementation of three common rate-limiting algorithms:

- Fixed Window
- Sliding Window
- Token Bucket

The package provides a common `RateLimiter` interface, allowing different rate-limiting strategies to be swapped without changing the consuming application.

## Usage
All rate limiters implement the same interface:
```typescript
interface RateLimiter {
  allow(key: string): boolean;
}
```
The key identifies the entity being rate-limited. Depending on the application, this could be a user ID, API key, IP address, tenant ID, etc.

### Fixed Window

Allows a fixed number of requests within a fixed time window.

```typescript
import { FixedWindowRateLimiter } from '<package-name>';

// allow up to 100 requests per user per 60-second window
const rateLimiter = new FixedWindowRateLimiter(
  100,
  60 * 1000,
  clock
);

if (rateLimiter.allow('user-123')) {
  // process request
}
```

### Sliding Window

Tracks individual request timestamps and considers only requests within the most recent time window.

```typescript
import { SlidingWindowRateLimiter } from '<package-name>';

// allow up to 100 requests per user in the last 60 seconds
const rateLimiter = new SlidingWindowRateLimiter(
  100,
  60 * 1000,
  clock
);

if (rateLimiter.allow('user-123')) {
  // process request
}
```

###  Token Bucket

Allows short bursts up to a configurable capacity while continuously replenishing tokens at a configured rate.

```typescript
import { TokenBucketRateLimiter } from '<package-name>';

const rateLimiter = new TokenBucketRateLimiter(
  20,  // burst capacity
  100, // tokens replenished per minute
  clock
);

if (rateLimiter.allow('user-123')) {
  // process request
}
```

## Testing

The project uses [Vitest](https://vitest.dev/) for unit testing.

Run the tests with:

```
npm test
```