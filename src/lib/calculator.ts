// lib/calculator.ts - 計算ロジック

import { Play, Settings, Statistics } from '@/types';

/**
 * 30分効率を計算
 * @param plays プレイ記録配列
 * @param settings 設定（倍率、アイテムコスト）
 * @param elapsedSeconds 経過秒数
 * @returns 統計情報
 */
export function calculateStatistics(
  plays: Play[],
  settings: Settings,
  elapsedSeconds: number
): Statistics {
  const playCount = plays.length;

  // ①総素コイン
  const totalRawCoins = plays.reduce((sum, play) => sum + play.rawCoins, 0);

  // ②+Coin倍率適用
  const totalEarnedCoins = Math.round(totalRawCoins * settings.coinMultiplier);

  // ③アイテムコスト差し引き
  const totalItemCost = playCount * settings.itemCost;
  const netCoins = totalEarnedCoins - totalItemCost;

  // ④経過時間（分）で割る → 1分効率
  const elapsedMinutes = elapsedSeconds / 60;
  const efficiency1min = elapsedMinutes > 0 ? netCoins / elapsedMinutes : 0;

  // ⑤30倍 → 30分効率
  const efficiency30min = efficiency1min * 30;

  // その他の統計
  const averageCoins = playCount > 0 ? Math.round(totalRawCoins / playCount) : 0;

  return {
    playCount,
    totalRawCoins,
    totalEarnedCoins,
    totalItemCost,
    netCoins,
    averageCoins,
    elapsedMinutes,
    efficiency1min: Math.round(efficiency1min),
    efficiency30min: Math.round(efficiency30min),
  };
}

/**
 * 数値を日本語ロケールでフォーマット
 */
export function formatNumber(num: number): string {
  return Math.round(num).toLocaleString('ja-JP');
}

/**
 * 秒数を MM:SS 形式にフォーマット
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * ユニークIDを生成
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
