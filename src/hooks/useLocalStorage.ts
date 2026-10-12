'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';

// 同じキーを使うフック同士で更新を共有するためのリスナー
const listeners = new Map<string, Set<() => void>>();

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string, listener: () => void) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);

  // 別タブでの変更も反映
  const handleStorage = (e: StorageEvent) => {
    if (e.key === key) listener();
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.get(key)?.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * localStorageと同期するカスタムフック
 * SSR時とハイドレーション時はinitialValueを返し、その後localStorageの値に切り替わる
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // initialValueは呼び出しごとに新しいオブジェクトになり得るので固定する
  const [initial] = useState(initialValue);

  const raw = useSyncExternalStore(
    useCallback((listener) => subscribe(key, listener), [key]),
    () => readRaw(key),
    () => null
  );

  const storedValue = useMemo(() => parse(raw, initial), [raw, initial]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      const currentRaw = readRaw(key);
      const prev = parse(currentRaw, initial);
      const valueToStore = value instanceof Function ? value(prev) : value;
      const nextRaw = JSON.stringify(valueToStore);
      if (nextRaw === currentRaw) return; // 変化なしなら再レンダリングしない
      try {
        window.localStorage.setItem(key, nextRaw);
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
      notify(key);
    },
    [key, initial]
  );

  return [storedValue, setValue];
}
