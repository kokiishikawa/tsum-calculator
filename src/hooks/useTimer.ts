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
 * バックグラウンドでも正確に動作するようタイムスタンプベースで計算
 * @param initialSeconds 初期秒数（デフォルト: 1800秒 = 30分）
 */
export function useTimer(initialSeconds: number = 1800): UseTimerReturn {
  // 開始時刻（ミリ秒）
  const [startTime, setStartTime] = useState<number | null>(null);
  // 一時停止時点での経過秒数
  const [pausedElapsed, setPausedElapsed] = useState(0);
  // 実行中フラグ
  const [isRunning, setIsRunning] = useState(false);
  // 表示用の経過秒数（定期更新）
  const [displayElapsed, setDisplayElapsed] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 実際の経過秒数を計算
  const calculateElapsed = useCallback(() => {
    if (!isRunning || startTime === null) {
      return pausedElapsed;
    }
    const now = Date.now();
    const elapsed = pausedElapsed + Math.floor((now - startTime) / 1000);
    return Math.min(elapsed, initialSeconds); // 最大値を超えない
  }, [isRunning, startTime, pausedElapsed, initialSeconds]);

  // 表示を更新する関数
  const updateDisplay = useCallback(() => {
    setDisplayElapsed(calculateElapsed());
  }, [calculateElapsed]);

  // タイマー開始
  const start = useCallback(() => {
    if (calculateElapsed() >= initialSeconds) return; // 既に終了
    setStartTime(Date.now());
    setIsRunning(true);
  }, [calculateElapsed, initialSeconds]);

  // タイマー一時停止
  const pause = useCallback(() => {
    if (isRunning) {
      setPausedElapsed(calculateElapsed());
      setStartTime(null);
      setIsRunning(false);
    }
  }, [isRunning, calculateElapsed]);

  // タイマーリセット
  const reset = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    setPausedElapsed(0);
    setDisplayElapsed(0);
  }, []);

  // 定期的に表示を更新（1秒ごと）
  useEffect(() => {
    if (isRunning) {
      // 即座に更新
      updateDisplay();

      intervalRef.current = setInterval(() => {
        const elapsed = calculateElapsed();
        setDisplayElapsed(elapsed);

        // 時間切れチェック
        if (elapsed >= initialSeconds) {
          setIsRunning(false);
          setPausedElapsed(initialSeconds);
          setStartTime(null);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isRunning, calculateElapsed, updateDisplay, initialSeconds]);

  // Page Visibility API: ページが再表示されたときに更新
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning) {
        updateDisplay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, updateDisplay]);

  // フォーカス復帰時にも更新
  useEffect(() => {
    const handleFocus = () => {
      if (isRunning) {
        updateDisplay();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isRunning, updateDisplay]);

  const elapsedSeconds = displayElapsed;
  const timeLeft = Math.max(0, initialSeconds - elapsedSeconds);

  return {
    timeLeft,
    isRunning,
    elapsedSeconds,
    start,
    pause,
    reset,
  };
}
