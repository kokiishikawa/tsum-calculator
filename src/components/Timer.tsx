'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/calculator';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  timeLeft: number;
  isRunning: boolean;
  elapsedSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function Timer({
  timeLeft,
  isRunning,
  elapsedSeconds,
  onStart,
  onPause,
  onReset,
}: TimerProps) {
  const isFinished = timeLeft === 0;

  return (
    <Card className="bg-sky-500 text-white">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* 残り時間 */}
          <div>
            <p className="text-sm opacity-80">残り時間</p>
            <p
              className={`text-6xl font-bold font-mono tracking-wider ${
                isFinished ? 'text-yellow-300 animate-pulse' : ''
              }`}
            >
              {formatTime(timeLeft)}
            </p>
          </div>

          {/* 経過時間 */}
          <div>
            <p className="text-sm opacity-80">経過時間</p>
            <p className="text-2xl font-mono">{formatTime(elapsedSeconds)}</p>
          </div>

          {/* コントロールボタン */}
          <div className="flex justify-center gap-3 pt-2">
            {!isRunning ? (
              <Button
                onClick={onStart}
                disabled={isFinished}
                size="lg"
                className="bg-white text-sky-600 hover:bg-sky-50 font-bold"
              >
                <Play className="w-5 h-5 mr-2" />
                スタート
              </Button>
            ) : (
              <Button
                onClick={onPause}
                size="lg"
                className="bg-white text-sky-600 hover:bg-sky-50 font-bold"
              >
                <Pause className="w-5 h-5 mr-2" />
                一時停止
              </Button>
            )}
            <Button
              onClick={onReset}
              size="lg"
              variant="secondary"
              className="bg-sky-600 text-white hover:bg-sky-700 font-bold"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              リセット
            </Button>
          </div>

          {isFinished && (
            <p className="text-yellow-300 font-bold animate-bounce">
              30分経過しました！
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
