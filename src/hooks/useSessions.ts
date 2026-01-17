'use client';

import { useCallback } from 'react';
import { SavedSession, Play, Settings, Statistics } from '@/types';
import { generateId } from '@/lib/calculator';
import { useLocalStorage } from './useLocalStorage';

interface UseSessionsReturn {
  sessions: SavedSession[];
  saveSession: (
    plays: Play[],
    settings: Settings,
    statistics: Statistics,
    elapsedSeconds: number
  ) => void;
  deleteSession: (id: string) => void;
  clearAllSessions: () => void;
}

/**
 * セッション保存を管理するカスタムフック
 */
export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = useLocalStorage<SavedSession[]>(
    'tsum-calculator-sessions',
    []
  );

  // セッションを保存
  const saveSession = useCallback(
    (
      plays: Play[],
      settings: Settings,
      statistics: Statistics,
      elapsedSeconds: number
    ) => {
      if (plays.length === 0) return;

      const newSession: SavedSession = {
        id: generateId(),
        savedAt: Date.now(),
        plays,
        settings,
        statistics,
        elapsedSeconds,
      };
      setSessions((prev) => [newSession, ...prev]);
    },
    [setSessions]
  );

  // セッションを削除
  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((session) => session.id !== id));
    },
    [setSessions]
  );

  // 全セッション削除
  const clearAllSessions = useCallback(() => {
    setSessions([]);
  }, [setSessions]);

  return {
    sessions,
    saveSession,
    deleteSession,
    clearAllSessions,
  };
}
