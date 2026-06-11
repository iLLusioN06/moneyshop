import "@testing-library/jest-dom";

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
