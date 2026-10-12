// lib/calculator.ts - 計算ロジック

import {
  Play,
  Settings,
  Statistics,
  SavedSession,
  TimelinePoint,
  TsumStats,
  ITEM_COST_PRESETS,
} from '@/types';

/**
 * 1プレイの獲得コイン（+Coin倍率適用後）
 * ゲーム内ではプレイごとにボーナスが付くため、プレイ単位で丸める
 */
export function calculateEarnedCoins(rawCoins: number, coinMultiplier: number): number {
  return Math.round(rawCoins * coinMultiplier);
}

/**
 * 実質コインと経過秒数から30分効率を計算（経過0秒なら0）
 */
export function calculateEfficiency30min(netCoins: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.round((netCoins / elapsedSeconds) * 1800);
}

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

  // ②+Coin倍率適用（プレイ単位で丸めて合計 → 履歴テーブルの合計と一致する）
  const totalEarnedCoins = plays.reduce(
    (sum, play) => sum + calculateEarnedCoins(play.rawCoins, settings.coinMultiplier),
    0
  );

  // ③アイテムコスト差し引き
  const totalItemCost = playCount * settings.itemCost;
  const netCoins = totalEarnedCoins - totalItemCost;

  // ④経過時間（分）で割る → 1分効率
  const elapsedMinutes = elapsedSeconds / 60;
  const efficiency1min = elapsedSeconds > 0 ? netCoins / elapsedMinutes : 0;

  // ⑤30倍 → 30分効率（丸め誤差を避けるため丸める前の1分効率から計算）
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
 * グラフ用に各プレイ時点の推移を計算
 */
export function calculateTimeline(plays: Play[], settings: Settings): TimelinePoint[] {
  let cumulativeNetCoins = 0;
  return plays.map((play, index) => {
    const earnedCoins = calculateEarnedCoins(play.rawCoins, settings.coinMultiplier);
    const netCoins = earnedCoins - settings.itemCost;
    cumulativeNetCoins += netCoins;
    return {
      playNumber: index + 1,
      rawCoins: play.rawCoins,
      earnedCoins,
      netCoins,
      cumulativeNetCoins,
      elapsedTime: play.elapsedTime,
      efficiency30min:
        play.elapsedTime > 0
          ? calculateEfficiency30min(cumulativeNetCoins, play.elapsedTime)
          : null,
    };
  });
}

/**
 * 保存済みセッションからツム別の成績を集計（30分効率の高い順）
 */
export function calculateTsumStats(sessions: SavedSession[]): TsumStats[] {
  const groups = new Map<string, SavedSession[]>();
  for (const session of sessions) {
    const tsum = (session.settings.usedTsum ?? '').trim();
    groups.set(tsum, [...(groups.get(tsum) ?? []), session]);
  }

  return [...groups.entries()]
    .map(([tsum, list]) => {
      const efficiencies = list.map((s) => s.statistics.efficiency30min);
      const totalPlays = list.reduce((sum, s) => sum + s.statistics.playCount, 0);
      const totalRaw = list.reduce((sum, s) => sum + s.statistics.totalRawCoins, 0);
      return {
        tsum,
        sessionCount: list.length,
        best30min: Math.max(...efficiencies),
        average30min: Math.round(
          efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length
        ),
        averageRawCoins: totalPlays > 0 ? Math.round(totalRaw / totalPlays) : 0,
        totalNetCoins: list.reduce((sum, s) => sum + s.statistics.netCoins, 0),
      };
    })
    .sort((a, b) => b.best30min - a.best30min);
}

/**
 * 数値を日本語ロケールでフォーマット(例：12,345,678)
 */
export function formatNumber(num: number): string {
  return Math.round(num).toLocaleString('ja-JP');
}

/**
 * 秒数を MM:SS 形式にフォーマット
 */
export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * ユニークIDを生成
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * アイテムコストからプリセット名を取得（該当なしは金額表示）
 */
export function getItemCostLabel(itemCost: number): string {
  const preset = ITEM_COST_PRESETS.find((p) => p.value === itemCost);
  return preset ? preset.label : `${formatNumber(itemCost)}コイン`;
}
