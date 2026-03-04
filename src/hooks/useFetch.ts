import { useEffect, useState } from "react";

type UseFetchOptions<T> = {
  notFoundValue?: T;
};

export function useFetch<T>(url: string | null, options?: UseFetchOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notFoundValue = options?.notFoundValue;

  useEffect(() => {
    if (!url) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(url!, { signal: controller.signal });

        if (res.status === 404 && notFoundValue !== undefined) {
          setData(notFoundValue);
          return;
        }

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const json = (await res.json()) as T;
        setData(json);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, [url, notFoundValue]);

  return { data, loading, error, setData };
}
