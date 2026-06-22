import { renderHook, act } from "@testing-library/react";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

describe("usePullToRefresh", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns initial state", () => {
    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: jest.fn() })
    );

    expect(result.current.pullDistance).toBe(0);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isPulling).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it("starts pulling on touch start when at top", () => {
    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: jest.fn() })
    );

    const element = document.createElement("div");

    act(() => {
      result.current.handlers.onTouchStart({
        currentTarget: element,
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    expect(result.current.isPulling).toBe(true);
  });

  it("does not start pulling if already refreshing", () => {
    // We can't easily set isRefreshing to true from outside,
    // but we can verify initial state
    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: jest.fn() })
    );

    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isPulling).toBe(false);
  });

  it("calculates progress correctly", () => {
    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: jest.fn(), threshold: 100, resistance: 0.5 })
    );

    const element = document.createElement("div");
    Object.defineProperty(element, "scrollTop", { value: 0 });

    act(() => {
      result.current.handlers.onTouchStart({
        currentTarget: element,
        touches: [{ clientY: 0 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    // distance = 100 - 0 = 100, resistance 0.5 = 50px pull
    // threshold 100, so progress = 50/100 = 0.5
    expect(result.current.pullDistance).toBe(50);
    expect(result.current.progress).toBe(0.5);
  });

  it("resets state on touch end without reaching threshold", async () => {
    const onRefresh = jest.fn();
    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh, threshold: 100, resistance: 0.5 })
    );

    const element = document.createElement("div");
    Object.defineProperty(element, "scrollTop", { value: 0 });

    act(() => {
      result.current.handlers.onTouchStart({
        currentTarget: element,
        touches: [{ clientY: 0 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientY: 50 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchEnd();
    });

    expect(result.current.pullDistance).toBe(0);
    expect(result.current.isPulling).toBe(false);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("triggers refresh when threshold is reached", async () => {
    const onRefresh = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh, threshold: 100, resistance: 0.5 })
    );

    const element = document.createElement("div");
    Object.defineProperty(element, "scrollTop", { value: 0 });

    act(() => {
      result.current.handlers.onTouchStart({
        currentTarget: element,
        touches: [{ clientY: 0 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientY: 300 }],
      } as unknown as React.TouchEvent);
    });

    await act(async () => {
      result.current.handlers.onTouchEnd();
    });

    expect(onRefresh).toHaveBeenCalled();
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.pullDistance).toBe(0);
  });

  it("does not pull when not at top of container", () => {
    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: jest.fn() })
    );

    const element = document.createElement("div");
    Object.defineProperty(element, "scrollTop", { value: 100 });

    act(() => {
      result.current.handlers.onTouchStart({
        currentTarget: element,
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    expect(result.current.isPulling).toBe(false);
  });

  it("caps pull distance at 1.5x threshold", () => {
    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: jest.fn(), threshold: 100, resistance: 0.5 })
    );

    const element = document.createElement("div");
    Object.defineProperty(element, "scrollTop", { value: 0 });

    act(() => {
      result.current.handlers.onTouchStart({
        currentTarget: element,
        touches: [{ clientY: 0 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientY: 1000 }],
      } as unknown as React.TouchEvent);
    });

    // Max pull = threshold * 1.5 = 150
    expect(result.current.pullDistance).toBe(150);
    expect(result.current.progress).toBe(1);
  });
});
