'use client';

import { Timer } from '@/components/Timer';
import { Settings } from '@/components/Settings';
import { PlayInput } from '@/components/PlayInput';
import { Statistics } from '@/components/Statistics';
import { PlayHistory } from '@/components/PlayHistory';
import { useTimer, useCalculator } from '@/hooks';

export default function Home() {
  const timer = useTimer(1800); // 30分 = 1800秒
  const calculator = useCalculator(timer.elapsedSeconds);

  const handleAddPlay = (rawCoins: number) => {
    calculator.addPlay(rawCoins, timer.elapsedSeconds);
  };

  const handleReset = () => {
    if (window.confirm('タイマーとすべての記録をリセットしますか？')) {
      timer.reset();
      calculator.clearAll();
    }
  };

  return (
    <main className="min-h-screen bg-sky-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-sky-700 pt-4">
          ツムツム 30分効率計算機
        </h1>

        {/* タイマーセクション */}
        <Timer
          timeLeft={timer.timeLeft}
          isRunning={timer.isRunning}
          elapsedSeconds={timer.elapsedSeconds}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={handleReset}
        />

        {/* 設定セクション */}
        <Settings
          settings={calculator.settings}
          onUpdateSettings={calculator.updateSettings}
        />

        {/* 入力セクション */}
        <PlayInput
          onAddPlay={handleAddPlay}
          disabled={timer.timeLeft === 0}
        />

        {/* 統計表示セクション */}
        <Statistics statistics={calculator.statistics} />

        {/* 履歴テーブルセクション */}
        <PlayHistory
          plays={calculator.plays}
          settings={calculator.settings}
          onDeletePlay={calculator.deletePlay}
          onClearAll={calculator.clearAll}
        />

        {/* フッター */}
        <footer className="text-center text-sm text-muted-foreground py-4">
          <p>ツムツム 30分効率計算機 v1.0</p>
        </footer>
      </div>
    </main>
  );
}
