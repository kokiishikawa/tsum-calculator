'use client';

import { useCallback, useMemo } from 'react';
import { Play, Settings, Statistics, DEFAULT_SETTINGS } from '@/types';
import { calculateStatistics, generateId } from '@/lib/calculator';
import { useLocalStorage } from './useLocalStorage';

interface UseCalculatorReturn {
  plays: Play[];
  settings: Settings;
  statistics: Statistics;
  addPlay: (rawCoins: number, elapsedTime: number) => void;
  deletePlay: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  clearAll: () => void;
}

/**
 * 計算ロジックとプレイ記録を管理するカスタムフック
 */
export function useCalculator(elapsedSeconds: number = 0): UseCalculatorReturn {
  const [plays, setPlays] = useLocalStorage<Play[]>('tsum-calculator-plays', []);
  const [settings, setSettings] = useLocalStorage<Settings>(
    'tsum-calculator-settings',
    DEFAULT_SETTINGS
  );

  // 統計情報を計算（メモ化）
  const statistics = useMemo(() => {
    return calculateStatistics(plays, settings, elapsedSeconds);
  }, [plays, settings, elapsedSeconds]);

  // プレイを追加
  const addPlay = useCallback(
    (rawCoins: number, elapsedTime: number) => {
      const newPlay: Play = {
        id: generateId(),
        rawCoins,
        timestamp: Date.now(),
        elapsedTime,
      };
      setPlays((prev) => [newPlay, ...prev]);
    },
    [setPlays]
  );

  // プレイを削除
  const deletePlay = useCallback(
    (id: string) => {
      setPlays((prev) => prev.filter((play) => play.id !== id));
    },
    [setPlays]
  );

  // 設定を更新
  const updateSettings = useCallback(
    (newSettings: Partial<Settings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    [setSettings]
  );

  // 全てクリア
  const clearAll = useCallback(() => {
    setPlays([]);
  }, [setPlays]);

  return {
    plays,
    settings,
    statistics,
    addPlay,
    deletePlay,
    updateSettings,
    clearAll,
  };
}
