import "@testing-library/jest-dom";

// Polyfill Response for jsdom environment (used by NextResponse mock)
if (typeof globalThis.Response === "undefined") {
  (globalThis as Record<string, unknown>).Response = class MockResponse {
    body: string;
    status: number;
    headers: Record<string, string>;
    ok: boolean;

    constructor(body?: string | null, init?: ResponseInit) {
      this.body = body || "";
      this.status = init?.status || 200;
      this.headers = (init?.headers as Record<string, string>) || {};
      this.ok = this.status >= 200 && this.status < 300;
    }

    json() {
      return JSON.parse(this.body);
    }

    text() {
      return this.body;
    }
  };
}

// Mock NextResponse for jsdom environment
jest.mock("next/server", () => ({
  NextResponse: class MockNextResponse {
    static json(data: unknown, init?: ResponseInit) {
      return new Response(JSON.stringify(data), {
        status: init?.status || 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    constructor(body?: BodyInit, init?: ResponseInit) {
      return new Response(body, init);
    }
  },
}));

// Polyfill: make setInterval return an object with .unref() for jsdom compatibility.
// The rate-limit module calls setInterval(...).unref() which doesn't exist in jsdom.
const origSetInterval = global.setInterval.bind(global);
const origSetTimeout = global.setTimeout.bind(global);
global.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
  const id = origSetInterval(handler, timeout, ...args);
  return Object.assign(id, { unref: () => {} });
}) as unknown as typeof global.setInterval;
global.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
  const id = origSetTimeout(handler, timeout, ...args);
  return Object.assign(id, { unref: () => {} });
}) as unknown as typeof global.setTimeout;
