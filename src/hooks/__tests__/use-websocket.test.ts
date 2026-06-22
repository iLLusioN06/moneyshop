import { renderHook, act } from "@testing-library/react";
import { useWebSocket } from "@/hooks/use-websocket";
import { WS_EVENTS } from "@/lib/ws-types";

// Mock socket.io-client
const mockOn = jest.fn();
const mockEmit = jest.fn();
const mockDisconnect = jest.fn();
const mockConnect = jest.fn();
const mockSocket = {
  on: mockOn,
  emit: mockEmit,
  disconnect: mockDisconnect,
  connect: mockConnect,
  connected: true,
};

const mockIo = jest.fn(() => mockSocket);
jest.mock("socket.io-client", () => ({
  io: (...args: unknown[]) => mockIo(...args),
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "user1" } } }),
}));

describe("useWebSocket", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOn.mockClear();
    mockEmit.mockClear();
    mockDisconnect.mockClear();
    mockConnect.mockClear();
  });

  it("connects on mount", () => {
    renderHook(() => useWebSocket());

    expect(mockIo).toHaveBeenCalled();
  });

  it("registers event listeners on connect", () => {
    renderHook(() => useWebSocket());

    // Find the connect handler registration
    const connectHandlerCall = mockOn.mock.calls.find(
      ([event]: [string]) => event === "connect"
    );
    expect(connectHandlerCall).toBeDefined();
  });

  it("registers transaction event listener", () => {
    const onTransaction = jest.fn();
    renderHook(() => useWebSocket({ onTransaction }));

    expect(mockOn).toHaveBeenCalledWith(
      WS_EVENTS.TRANSACTION,
      expect.any(Function)
    );
  });

  it("registers balance update event listener", () => {
    const onBalanceUpdate = jest.fn();
    renderHook(() => useWebSocket({ onBalanceUpdate }));

    expect(mockOn).toHaveBeenCalledWith(
      WS_EVENTS.BALANCE_UPDATE,
      expect.any(Function)
    );
  });

  it("registers notification event listener", () => {
    const onNotification = jest.fn();
    renderHook(() => useWebSocket({ onNotification }));

    expect(mockOn).toHaveBeenCalledWith(
      WS_EVENTS.NOTIFICATION,
      expect.any(Function)
    );
  });

  it("calls onConnectionChange when connected", () => {
    const onConnectionChange = jest.fn();
    renderHook(() => useWebSocket({ onConnectionChange }));

    // Simulate connect event
    const connectHandler = mockOn.mock.calls.find(
      ([event]: [string]) => event === "connect"
    );
    expect(connectHandler).toBeDefined();

    if (connectHandler) {
      act(() => {
        connectHandler[1]();
      });
    }

    expect(onConnectionChange).toHaveBeenCalledWith(true);
  });

  it("disconnects on unmount", () => {
    const { unmount } = renderHook(() => useWebSocket());

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("starts in disconnected state", () => {
    const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

    expect(result.current.state).toBe("disconnected");
    expect(result.current.connected).toBe(false);
  });

  it("calls onStateChange when state updates", () => {
    const onStateChange = jest.fn();
    renderHook(() => useWebSocket({ onStateChange }));

    expect(onStateChange).toHaveBeenCalledWith("connecting");
  });

  it("exposes reconnectAttempt and socket", () => {
    const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

    expect(result.current.reconnectAttempt).toBe(0);
    expect(result.current.socket).toBeNull();
    expect(typeof result.current.reconnect).toBe("function");
  });

  it("registers disconnect event listener", () => {
    renderHook(() => useWebSocket());

    const disconnectHandlerCall = mockOn.mock.calls.find(
      ([event]: [string]) => event === "disconnect"
    );
    expect(disconnectHandlerCall).toBeDefined();
  });

  it("registers reconnect_attempt event listener", () => {
    renderHook(() => useWebSocket());

    const reconnectAttemptCall = mockOn.mock.calls.find(
      ([event]: [string]) => event === "reconnect_attempt"
    );
    expect(reconnectAttemptCall).toBeDefined();
  });

  it("registers connect_error event listener", () => {
    renderHook(() => useWebSocket());

    const connectErrorCall = mockOn.mock.calls.find(
      ([event]: [string]) => event === "connect_error"
    );
    expect(connectErrorCall).toBeDefined();
  });
});
