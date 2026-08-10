# rate-limiter

rate-limiter/
├── src/
│   ├── RateLimiter.ts
│   ├── FixedWindowRateLimiter.ts
│   ├── SlidingWindowRateLimiter.ts
│   ├── TokenBucketRateLimiter.ts
│   └── index.ts
├── test/
│   ├── FixedWindowRateLimiter.test.ts
│   ├── SlidingWindowRateLimiter.test.ts
│   └── TokenBucketRateLimiter.test.ts
├── README.md
├── package.json
├── tsconfig.json
└── .gitignore

The rate limiter is agnostic to client identity. The consumer provides a unique key representing the entity being rate-limited.