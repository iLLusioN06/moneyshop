import "@testing-library/jest-dom";

// ─── Polyfill TextEncoder/TextDecoder for Prisma ──
if (typeof globalThis.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}

// ─── Polyfill Request for jsdom (used by NextRequest) ──
if (typeof globalThis.Request === "undefined") {
  // Minimal Request polyfill for testing
  class MockRequest {
    private _url: string;
    private _method: string;
    private _body: string | null;
    private _headers: Record<string, string>;

    constructor(input: string | URL, init?: RequestInit) {
      this._url = typeof input === "string" ? input : input.toString();
      this._method = init?.method?.toUpperCase() || "GET";
      this._body = init?.body as string | null || null;
      const h = init?.headers as Record<string, string> | undefined;
      this._headers = h || {};
      if (!this._headers["Content-Type"] && this._body) {
        this._headers["Content-Type"] = "application/json";
      }
    }

    get url() { return this._url; }
    get method() { return this._method; }
    get headers() { return new Map(Object.entries(this._headers)); }

    json() { return JSON.parse(this._body || "{}"); }
    text() { return Promise.resolve(this._body || ""); }
  }

  globalThis.Request = MockRequest as unknown as typeof Request;
}

// ─── Test Environment Variables ───────────────────
// Email (Resend) - email.ts module-level const RESEND_API_KEY import anında okunur
process.env.RESEND_API_KEY = "re_test_key";

// Polyfill Response for jsdom environment (used by NextResponse mock)
if (typeof globalThis.Response === "undefined") {
  (globalThis as Record<string, unknown>).Response = class MockResponse {
    body: string;
    status: number;
    headers: Record<string, string>;
    ok: boolean;
    private _body: string;

    constructor(body?: string | null, init?: ResponseInit) {
      this._body = body || "";
      this.body = body || "";
      this.status = init?.status || 200;
      this.headers = (init?.headers as Record<string, string>) || {};
      this.ok = this.status >= 200 && this.status < 300;
    }

    json() {
      return JSON.parse(this._body);
    }

    text() {
      return this._body;
    }

    static json(data: unknown, init?: ResponseInit) {
      return new MockResponse(JSON.stringify(data), init) as unknown as Response;
    }
  };
}

// Mock Next.js server modules for jsdom environment
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
  NextRequest: class MockNextRequest extends Request {
    public nextUrl: URL;
    public cookies: Map<string, string>;
    constructor(input: string | URL, init?: RequestInit) {
      super(input, init);
      this.nextUrl = new URL(input);
      this.cookies = new Map();
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
