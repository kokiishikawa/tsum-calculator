'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Statistics as StatisticsType, Play, Settings } from '@/types';
import { formatNumber, formatTime } from '@/lib/calculator';
import {
  Coins,
  TrendingUp,
  Clock,
  Gamepad2,
  Calculator,
  Minus,
  Wallet,
  Share2,
  Copy,
  Check,
} from 'lucide-react';

interface StatisticsProps {
  statistics: StatisticsType;
  plays: Play[];
  settings: Settings;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  highlight?: boolean;
  subValue?: string;
}

function StatCard({ label, value, icon, highlight, subValue }: StatCardProps) {
  return (
    <Card
      className={highlight ? 'bg-sky-500 text-white' : ''}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span
            className={`text-sm ${highlight ? 'text-white/80' : 'text-muted-foreground'}`}
          >
            {label}
          </span>
        </div>
        <p
          className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-foreground'}`}
        >
          {typeof value === 'number' ? formatNumber(value) : value}
        </p>
        {subValue && (
          <p
            className={`text-xs mt-1 ${highlight ? 'text-white/70' : 'text-muted-foreground'}`}
          >
            {subValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function Statistics({ statistics, plays, settings }: StatisticsProps) {
  const [copied, setCopied] = useState(false);

  const elapsedTimeFormatted =
    statistics.elapsedMinutes > 0
      ? formatTime(Math.round(statistics.elapsedMinutes * 60))
      : '00:00';

  // 共有用テキストを生成
  const generateShareText = () => {
    // プレイ詳細テキストを生成（記録順）
    const playDetails = plays
      .map((play, index) => {
        const earnedCoins = Math.round(play.rawCoins * settings.coinMultiplier);
        return `${index + 1}回目: ${formatNumber(play.rawCoins)} → ${formatNumber(earnedCoins)}`;
      })
      .join('\n');

    return `【ツムツム 30分効率】

■ 結果
30分効率: ${formatNumber(statistics.efficiency30min)} コイン
1分効率: ${formatNumber(statistics.efficiency1min)} コイン

■ サマリー
プレイ回数: ${statistics.playCount} 回
経過時間: ${elapsedTimeFormatted}
総素コイン: ${formatNumber(statistics.totalRawCoins)}
総獲得コイン: ${formatNumber(statistics.totalEarnedCoins)}
アイテムコスト: ${formatNumber(statistics.totalItemCost)}
実質獲得: ${formatNumber(statistics.netCoins)} コイン

■ プレイ詳細（素コイン → 獲得）
${playDetails || 'なし'}

#ツムツム #効率計算`;
  };

  // Web Share API で共有
  const handleShare = async () => {
    const text = generateShareText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ツムツム 30分効率',
          text: text,
        });
      } catch (error) {
        // ユーザーがキャンセルした場合など
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      // Web Share API非対応の場合はクリップボードにコピー
      handleCopy();
    }
  };

  // クリップボードにコピー
  const handleCopy = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // LINEで共有
  const handleLineShare = () => {
    const text = generateShareText();
    const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* メイン指標: 30分効率 */}
      <Card className="bg-blue-600 text-white">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6" />
            <span className="text-lg opacity-90">30分効率</span>
          </div>
          <p className="text-5xl font-bold tracking-tight">
            {formatNumber(statistics.efficiency30min)}
          </p>
          <p className="text-sm opacity-80 mt-2">コイン / 30分</p>
        </CardContent>
      </Card>

      {/* 共有ボタン */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={handleShare}
          variant="outline"
          className="flex-1 max-w-32"
        >
          <Share2 className="w-4 h-4 mr-2" />
          共有
        </Button>
        <Button
          onClick={handleCopy}
          variant="outline"
          className="flex-1 max-w-32"
        >
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {copied ? 'コピー済' : 'コピー'}
        </Button>
        <Button
          onClick={handleLineShare}
          className="flex-1 max-w-32 bg-[#06C755] hover:bg-[#05b04c] text-white"
        >
          LINE
        </Button>
      </div>

      {/* サブ指標グリッド */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="1分効率"
          value={statistics.efficiency1min}
          icon={<TrendingUp className="w-4 h-4 text-white" />}
          highlight
          subValue="コイン / 分"
        />
        <StatCard
          label="プレイ回数"
          value={statistics.playCount}
          icon={<Gamepad2 className="w-4 h-4 text-muted-foreground" />}
          subValue="回"
        />
        <StatCard
          label="経過時間"
          value={elapsedTimeFormatted}
          icon={<Clock className="w-4 h-4 text-muted-foreground" />}
        />
        <StatCard
          label="平均素コイン"
          value={statistics.averageCoins}
          icon={<Calculator className="w-4 h-4 text-muted-foreground" />}
          subValue="/ プレイ"
        />
      </div>

      {/* コイン詳細 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="総素コイン"
          value={statistics.totalRawCoins}
          icon={<Coins className="w-4 h-4 text-yellow-500" />}
        />
        <StatCard
          label="総獲得コイン"
          value={statistics.totalEarnedCoins}
          icon={<Coins className="w-4 h-4 text-green-500" />}
          subValue="倍率適用後"
        />
        <StatCard
          label="総アイテムコスト"
          value={statistics.totalItemCost}
          icon={<Minus className="w-4 h-4 text-red-500" />}
        />
        <StatCard
          label="実質獲得コイン"
          value={statistics.netCoins}
          icon={<Wallet className="w-4 h-4 text-blue-500" />}
          subValue="純利益"
        />
      </div>
    </div>
  );
}
