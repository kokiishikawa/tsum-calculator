'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Statistics as StatisticsType } from '@/types';
import { formatNumber, formatTime } from '@/lib/calculator';
import {
  Coins,
  TrendingUp,
  Clock,
  Gamepad2,
  Calculator,
  Minus,
  Wallet,
} from 'lucide-react';

interface StatisticsProps {
  statistics: StatisticsType;
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

export function Statistics({ statistics }: StatisticsProps) {
  const elapsedTimeFormatted =
    statistics.elapsedMinutes > 0
      ? formatTime(Math.round(statistics.elapsedMinutes * 60))
      : '00:00';

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
