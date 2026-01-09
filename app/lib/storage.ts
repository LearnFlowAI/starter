import { useEffect, useState } from "react";

export function useLocalState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(key);
    if (stored) {
      try {
        setState(JSON.parse(stored) as T);
      } catch {
        setState(initialValue);
      }
    }
    setReady(true);
  }, [initialValue, key]);

  useEffect(() => {
    if (!ready || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, ready, state]);

  return [state, setState, ready] as const;
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}
