import { renderHook, waitFor, act } from "@testing-library/react";
import {
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import type { Category } from "@/types";

const mockCategory: Category = {
  id: "1",
  userId: "user1",
  name: "Maaş",
  type: "INCOME",
  icon: "briefcase",
  color: "#10b981",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-06-01"),
};

describe("useCategories", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns categories on success", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: [mockCategory] }),
    });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual([mockCategory]);
    expect(result.current.error).toBe("");
  });

  it("returns error on failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Hata" }),
    });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Hata");
  });

  it("handles network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCategories());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Network error");
  });

  it("uses default error when json.error is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Bir hata oluştu.");
  });

  it("starts with loading state", () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: [mockCategory] }),
    });

    const { result } = renderHook(() => useCategories());

    expect(result.current.isLoading).toBe(true);
  });

  it("provides refetch function", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: [mockCategory] }),
    });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.refetch();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

describe("useCategory", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches single category", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockCategory }),
    });

    const { result } = renderHook(() => useCategory("1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockCategory);
    expect(result.current.error).toBe("");
  });

  it("skips fetch when id is empty", () => {
    global.fetch = jest.fn();

    renderHook(() => useCategory(""));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns error on failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Kategori bulunamadı" }),
    });

    const { result } = renderHook(() => useCategory("999"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Kategori bulunamadı");
  });

  it("uses default error when json.error is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    const { result } = renderHook(() => useCategory("1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Bir hata oluştu.");
  });

  it("starts with loading state", () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockCategory }),
    });

    const { result } = renderHook(() => useCategory("1"));

    expect(result.current.isLoading).toBe(true);
  });

  it("handles network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCategory("1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Network error");
  });
});

describe("useCreateCategory", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("creates category", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockCategory }),
    });

    const { result } = renderHook(() => useCreateCategory());

    await act(async () => {
      await result.current.mutate({ method: "POST", body: { name: "Maaş", type: "INCOME" } });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/categories",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("tracks loading state during creation", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockCategory }),
    });

    const { result } = renderHook(() => useCreateCategory());

    expect(result.current.isLoading).toBe(false);

    let mutatePromise: Promise<unknown>;
    act(() => {
      mutatePromise = result.current.mutate({ method: "POST", body: { name: "Maaş", type: "INCOME" } });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await mutatePromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("handles network error during creation", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCreateCategory());

    let response;
    await act(async () => {
      response = await result.current.mutate({ method: "POST", body: { name: "Maaş", type: "INCOME" } });
    });

    expect(response).toBeNull();
    expect(result.current.error).toBe("Network error");
  });

  it("calls onSuccess callback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockCategory }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useCreateCategory());

    await act(async () => {
      await result.current.mutate({
        method: "POST",
        body: { name: "Maaş", type: "INCOME" },
        onSuccess,
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockCategory);
  });

  it("handles creation error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Oluşturma hatası" }),
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useCreateCategory());

    await act(async () => {
      await result.current.mutate({
        method: "POST",
        body: { name: "Maaş", type: "INCOME" },
        onError,
      });
    });

    expect(onError).toHaveBeenCalledWith("Oluşturma hatası");
  });
});

describe("useUpdateCategory", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("updates category", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockCategory }),
    });

    const { result } = renderHook(() => useUpdateCategory("1"));

    await act(async () => {
      await result.current.mutate({ method: "PUT", body: { name: "Güncel" } });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/categories/1"),
      expect.anything()
    );
  });

  it("handles update error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Güncelleme hatası" }),
    });

    const { result } = renderHook(() => useUpdateCategory("1"));

    let response;
    await act(async () => {
      response = await result.current.mutate({ method: "PUT", body: { name: "Güncel" } });
    });

    expect(response).toBeNull();
  });

  it("tracks loading state during update", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockCategory }),
    });

    const { result } = renderHook(() => useUpdateCategory("1"));

    expect(result.current.isLoading).toBe(false);

    let mutatePromise: Promise<unknown>;
    act(() => {
      mutatePromise = result.current.mutate({ method: "PUT", body: { name: "Güncel" } });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await mutatePromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("calls onSuccess callback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockCategory }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useUpdateCategory("1"));

    await act(async () => {
      await result.current.mutate({
        method: "PUT",
        body: { name: "Güncel" },
        onSuccess,
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockCategory);
  });

  it("calls onError callback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Güncelleme hatası" }),
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useUpdateCategory("1"));

    await act(async () => {
      await result.current.mutate({
        method: "PUT",
        body: { name: "Güncel" },
        onError,
      });
    });

    expect(onError).toHaveBeenCalledWith("Güncelleme hatası");
  });
});

describe("useDeleteCategory", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("deletes category", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => useDeleteCategory());

    await act(async () => {
      await result.current.mutate({ method: "POST" });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/categories",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("handles delete error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Silme hatası" }),
    });

    const { result } = renderHook(() => useDeleteCategory());

    let response;
    await act(async () => {
      response = await result.current.mutate({ method: "POST" });
    });

    expect(response).toBeNull();
  });

  it("tracks loading state during deletion", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => useDeleteCategory());

    expect(result.current.isLoading).toBe(false);

    let mutatePromise: Promise<unknown>;
    act(() => {
      mutatePromise = result.current.mutate({ method: "POST" });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await mutatePromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("handles network error during deletion", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useDeleteCategory());

    let response;
    await act(async () => {
      response = await result.current.mutate({ method: "POST" });
    });

    expect(response).toBeNull();
    expect(result.current.error).toBe("Network error");
  });

  it("calls onSuccess callback after deletion", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useDeleteCategory());

    await act(async () => {
      await result.current.mutate({ method: "POST", onSuccess });
    });

    expect(onSuccess).toHaveBeenCalled();
  });
});
