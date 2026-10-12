// lib/share.ts - 共有テキスト生成・共有処理

import { Play, Settings, Statistics } from '@/types';
import { calculateEarnedCoins, formatNumber, formatTime } from '@/lib/calculator';

interface ShareTextParams {
  plays: Play[];
  settings: Settings;
  statistics: Statistics;
  elapsedSeconds: number;
  savedAt?: number; // 保存済みセッションの場合のみ
}

/**
 * 共有用テキストを生成
 */
export function buildShareText({
  plays,
  settings,
  statistics,
  elapsedSeconds,
  savedAt,
}: ShareTextParams): string {
  const playDetails = plays
    .map((play, index) => {
      const earnedCoins = calculateEarnedCoins(play.rawCoins, settings.coinMultiplier);
      return `${index + 1}回目: ${formatNumber(play.rawCoins)} → ${formatNumber(earnedCoins)}`;
    })
    .join('\n');

  const header = [
    savedAt ? `記録日時: ${new Date(savedAt).toLocaleString('ja-JP')}` : null,
    settings.usedTsum ? `使用ツム: ${settings.usedTsum}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `【ツムツム 30分効率】
${header ? `${header}\n` : ''}
■ 結果
30分効率: ${formatNumber(statistics.efficiency30min)} コイン
1分効率: ${formatNumber(statistics.efficiency1min)} コイン

■ サマリー
プレイ回数: ${statistics.playCount} 回
経過時間: ${formatTime(elapsedSeconds)}
総素コイン: ${formatNumber(statistics.totalRawCoins)}
総獲得コイン: ${formatNumber(statistics.totalEarnedCoins)}
アイテムコスト: ${formatNumber(statistics.totalItemCost)}
実質獲得: ${formatNumber(statistics.netCoins)} コイン

■ プレイ詳細（素コイン → 獲得）
${playDetails || 'なし'}

#ツムツム #効率計算`;
}

/**
 * LINEで共有
 */
export function shareToLine(text: string): void {
  const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(text)}`;
  window.open(lineUrl, '_blank');
}
