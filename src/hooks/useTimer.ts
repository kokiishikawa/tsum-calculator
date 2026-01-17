'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  elapsedSeconds: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

/**
 * カウントダウンタイマーのカスタムフック
 * @param initialSeconds 初期秒数（デフォルト: 1800秒 = 30分）
 */
export function useTimer(initialSeconds: number = 1800): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // タイマーのクリーンアップ
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // タイマー開始
  const start = useCallback(() => {
    if (timeLeft <= 0) return;
    setIsRunning(true);
  }, [timeLeft]);

  // タイマー一時停止
  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  // タイマーリセット
  const reset = useCallback(() => {
    setIsRunning(false);
    clearTimer();
    setTimeLeft(initialSeconds);
    setElapsedSeconds(0);
  }, [clearTimer, initialSeconds]);

  // タイマーのメインロジック
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            clearTimer();
            return 0;
          }
          return prev - 1;
        });
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearTimer();
  }, [isRunning, timeLeft, clearTimer]);

  return {
    timeLeft,
    isRunning,
    elapsedSeconds,
    start,
    pause,
    reset,
  };
}
