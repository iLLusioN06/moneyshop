/**
 * @jest-environment node
 */
import { rateLimit, withRateLimit, resetRateLimitStore } from "@/lib/rate-limit";

beforeEach(() => {
  resetRateLimitStore();
});

describe("rateLimit", () => {
  it("returns success=true on first call", async () => {
    const result = await rateLimit("test-key", { maxRequests: 3, windowMs: 60_000 });
    expect(result.success).toBe(true);
  });

  it("returns remaining count on first call", async () => {
    const result = await rateLimit("test-key", { maxRequests: 5, windowMs: 60_000 });
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it("blocks after maxRequests exceeded", async () => {
    const config = { maxRequests: 2, windowMs: 60_000 };

    const first = await rateLimit("test-key", config);
    expect(first.success).toBe(true);

    const second = await rateLimit("test-key", config);
    expect(second.success).toBe(true);

    const third = await rateLimit("test-key", config);
    expect(third.success).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets after windowMs passes", async () => {
    jest.useFakeTimers();

    const config = { maxRequests: 1, windowMs: 60_000 };

    const first = await rateLimit("test-key", config);
    expect(first.success).toBe(true);

    // Advance time past the window
    jest.advanceTimersByTime(61_000);

    const second = await rateLimit("test-key", config);
    expect(second.success).toBe(true);

    jest.useRealTimers();
  });

  it("resetRateLimitStore clears all entries", async () => {
    await rateLimit("key-a", { maxRequests: 1, windowMs: 60_000 });
    await rateLimit("key-b", { maxRequests: 1, windowMs: 60_000 });

    resetRateLimitStore();

    // Should succeed again
    const result = await rateLimit("key-a", { maxRequests: 1, windowMs: 60_000 });
    expect(result.success).toBe(true);
  });

  it("uses default config when not provided", async () => {
    const result = await rateLimit("test-key");
    expect(result.limit).toBe(30);
  });

  it("returns remaining decreasing with each call", async () => {
    const config = { maxRequests: 5, windowMs: 60_000 };

    const r1 = await rateLimit("test-key", config);
    expect(r1.remaining).toBe(4);

    const r2 = await rateLimit("test-key", config);
    expect(r2.remaining).toBe(3);

    const r3 = await rateLimit("test-key", config);
    expect(r3.remaining).toBe(2);
  });
});

describe("withRateLimit", () => {
  it("calls handler when under limit", async () => {
    const handler = jest.fn().mockResolvedValue(new Response("OK"));
    const wrapped = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, handler);

    const req = new Request("http://localhost/api/test");
    const res = await wrapped(req);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("4");
  });

  it("returns 429 when limit exceeded", async () => {
    const handler = jest.fn().mockResolvedValue(new Response("OK"));
    const wrapped = withRateLimit({ maxRequests: 1, windowMs: 60_000 }, handler);

    const req = new Request("http://localhost/api/test");
    await wrapped(req); // first call - ok
    const res = await wrapped(req); // second call - blocked

    expect(handler).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(429);
  });

  it("includes rate limit headers on 429 response", async () => {
    const handler = jest.fn().mockResolvedValue(new Response("OK"));
    const wrapped = withRateLimit({ maxRequests: 1, windowMs: 60_000 }, handler);

    const req = new Request("http://localhost/api/test");
    await wrapped(req); // first call - consumed
    const res = await wrapped(req); // second call - blocked

    expect(res.status).toBe(429);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("1");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("uses custom keyFn when provided", async () => {
    const handler = jest.fn().mockResolvedValue(new Response("OK"));
    const keyFn = jest.fn().mockReturnValue("custom-key");
    const wrapped = withRateLimit({ maxRequests: 1, windowMs: 60_000 }, handler, keyFn);

    const req = new Request("http://localhost/api/test");
    await wrapped(req);
    const res = await wrapped(req);

    expect(keyFn).toHaveBeenCalledWith(req);
    expect(res.status).toBe(429);
  });
});
