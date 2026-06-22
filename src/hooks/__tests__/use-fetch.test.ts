import { renderHook, waitFor, act } from "@testing-library/react";
import { useFetch, useMutate } from "@/hooks/use-fetch";

const mockData = { id: "1", name: "Test" };

describe("useFetch", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("starts with loading state", () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    const { result } = renderHook(() => useFetch("/api/test"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("");
  });

  it("returns data on successful fetch", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    const { result } = renderHook(() => useFetch("/api/test"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe("");
  });

  it("returns error on unsuccessful fetch", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "API error" }),
    });

    const { result } = renderHook(() => useFetch("/api/test"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("API error");
  });

  it("handles network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network failure"));

    const { result } = renderHook(() => useFetch("/api/test"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Network failure");
  });

  it("skips fetch when skip is true", () => {
    global.fetch = jest.fn();

    const { result } = renderHook(() => useFetch("/api/test", { skip: true }));

    expect(result.current.isLoading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fetches new data when url changes", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockData }),
    });
    global.fetch = fetchMock;

    const { result, rerender } = renderHook(
      ({ url }) => useFetch(url),
      { initialProps: { url: "/api/test" } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ url: "/api/other" });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it("provides refetch function", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    const { result } = renderHook(() => useFetch("/api/test"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it("aborts previous request on refetch", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    const { result } = renderHook(() => useFetch("/api/test"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.refetch();
    });

    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });

  it("uses default error message when json.error is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    const { result } = renderHook(() => useFetch("/api/test"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Bir hata oluştu.");
  });
});

describe("useMutate", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("sends POST request and returns data", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    const { result } = renderHook(() => useMutate<typeof mockData>("/api/test"));

    let response: typeof mockData | null = null;
    await act(async () => {
      response = await result.current.mutate({
        method: "POST",
        body: { name: "Test" },
      });
    });

    expect(response).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      })
    );
  });

  it("handles error response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Validation error" }),
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useMutate("/api/test"));

    await act(async () => {
      const response = await result.current.mutate({
        method: "POST",
        body: { name: "" },
        onError,
      });
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe("Validation error");
    expect(onError).toHaveBeenCalledWith("Validation error");
  });

  it("calls onSuccess callback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useMutate<typeof mockData>("/api/test"));

    await act(async () => {
      await result.current.mutate({
        method: "PUT",
        body: mockData,
        onSuccess,
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it("handles network error in mutate", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useMutate("/api/test"));

    await act(async () => {
      const response = await result.current.mutate({
        method: "DELETE",
      });
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe("Network error");
  });

  it("tracks loading state", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    const { result } = renderHook(() => useMutate("/api/test"));

    expect(result.current.isLoading).toBe(false);

    let promise: Promise<unknown>;
    act(() => {
      promise = result.current.mutate({ method: "POST", body: {} });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("reset clears error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Error" }),
    });

    const { result } = renderHook(() => useMutate("/api/test"));

    await act(async () => {
      await result.current.mutate({ method: "POST", body: {} });
    });

    expect(result.current.error).toBe("Error");

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBe("");
  });
});
