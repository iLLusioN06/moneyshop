import { useState, useEffect, useCallback, useRef } from "react";

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string;
}

interface FetchOptions extends RequestInit {
  skip?: boolean;
}

export function useFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
) {
  const { skip = false, ...fetchOptions } = options;
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: !skip,
    error: "",
  });
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({ ...prev, isLoading: true, error: "" }));

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      const json = await res.json();

      if (controller.signal.aborted) return;

      if (!json.success) {
        setState({ data: null, isLoading: false, error: json.error || "Bir hata oluştu." });
        return;
      }

      setState({ data: json.data as T, isLoading: false, error: "" });
    } catch (err) {
      if (controller.signal.aborted) return;
      setState({
        data: null,
        isLoading: false,
        error: err instanceof Error ? err.message : "Bir hata oluştu.",
      });
    }
  }, [url, JSON.stringify(fetchOptions)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!skip) {
      execute();
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [execute, skip]);

  return { ...state, refetch: execute };
}

type MutateMethod = "POST" | "PUT" | "DELETE";

interface MutateOptions<T> {
  method: MutateMethod;
  body?: unknown;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useMutate<T = unknown>(url: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const mutate = useCallback(
    async (options: MutateOptions<T>) => {
      setIsLoading(true);
      setError("");

      try {
        const res = await fetch(url, {
          method: options.method,
          headers: { "Content-Type": "application/json" },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });
        const json = await res.json();

        if (!json.success) {
          const msg = json.error || "Bir hata oluştu.";
          setError(msg);
          options.onError?.(msg);
          return null;
        }

        const data = json.data as T;
        options.onSuccess?.(data);
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Bir hata oluştu.";
        setError(msg);
        options.onError?.(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [url]
  );

  return { mutate, isLoading, error, reset: () => setError("") };
}
