import { useEffect, useRef, useState } from "react";

function safeParse<T>(value: string | null, fallback: T, key: string) {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    // Log for diagnostics while falling back to the initial value.
    // eslint-disable-next-line no-console
    console.error(`无法解析 storage key "${key}" 的数据，已重置为初始值`, error);
    return fallback;
  }
}

export function useLocalState<T>(key: string, initialValue: T) {
  const initialRef = useRef(initialValue);
  const [state, setState] = useState<T>(initialRef.current);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(key);
    const parsed = safeParse<T>(stored, initialRef.current, key);
    setState(parsed);
    setReady(true);
  }, [key]);

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
