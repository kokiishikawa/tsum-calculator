'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  elapsedSeconds: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

/**
 * localStorageに保存するタイマー状態
 * 開始時刻を保存するので、リロードやタブ破棄後も計測が続く
 */
interface TimerSnapshot {
  startedAt: number | null; // 実行中の場合の再開時刻（ミリ秒）、停止中はnull
  pausedElapsed: number; // 最後に一時停止した時点の経過秒数
}

const INITIAL_SNAPSHOT: TimerSnapshot = { startedAt: null, pausedElapsed: 0 };

function computeElapsed(snapshot: TimerSnapshot, now: number, maxSeconds: number): number {
  const elapsed =
    snapshot.startedAt === null
      ? snapshot.pausedElapsed
      : snapshot.pausedElapsed + Math.floor((now - snapshot.startedAt) / 1000);
  return Math.min(Math.max(elapsed, 0), maxSeconds);
}

/**
 * カウントダウンタイマーのカスタムフック
 * バックグラウンドでも正確に動作するようタイムスタンプベースで計算
 * @param initialSeconds 初期秒数（デフォルト: 1800秒 = 30分）
 */
export function useTimer(initialSeconds: number = 1800): UseTimerReturn {
  const [snapshot, setSnapshot] = useLocalStorage<TimerSnapshot>(
    'tsum-calculator-timer',
    INITIAL_SNAPSHOT
  );
  // 表示更新用の現在時刻
  const [now, setNow] = useState(() => Date.now());

  const isRunning = snapshot.startedAt !== null;
  const elapsedSeconds = computeElapsed(snapshot, now, initialSeconds);

  // タイマー開始
  const start = useCallback(() => {
    const current = Date.now();
    setSnapshot((prev) => {
      if (prev.startedAt !== null || prev.pausedElapsed >= initialSeconds) return prev;
      return { ...prev, startedAt: current };
    });
    setNow(current);
  }, [setSnapshot, initialSeconds]);

  // タイマー一時停止
  const pause = useCallback(() => {
    const current = Date.now();
    setSnapshot((prev) =>
      prev.startedAt === null
        ? prev
        : { startedAt: null, pausedElapsed: computeElapsed(prev, current, initialSeconds) }
    );
    setNow(current);
  }, [setSnapshot, initialSeconds]);

  // タイマーリセット
  const reset = useCallback(() => {
    setSnapshot(INITIAL_SNAPSHOT);
  }, [setSnapshot]);

  // 実行中は表示を更新し、時間切れになったら停止する
  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      const current = Date.now();
      setNow(current);
      setSnapshot((prev) =>
        prev.startedAt !== null && computeElapsed(prev, current, initialSeconds) >= initialSeconds
          ? { startedAt: null, pausedElapsed: initialSeconds }
          : prev
      );
    };

    // 秒の切り替わりを取りこぼさないよう1秒より短い間隔で更新
    const intervalId = setInterval(tick, 250);
    // バックグラウンドから復帰したときは即座に更新
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', tick);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', tick);
    };
  }, [isRunning, setSnapshot, initialSeconds]);

  return {
    timeLeft: initialSeconds - elapsedSeconds,
    isRunning,
    elapsedSeconds,
    start,
    pause,
    reset,
  };
}
