'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatNumber, formatTime } from '@/lib/calculator';
import { Plus, Undo2 } from 'lucide-react';

interface PlayInputProps {
  onAddPlay: (rawCoins: number) => void;
  onUndo?: () => void; // 直前のプレイを取り消す
  lastRawCoins?: number; // 直前のプレイの素コイン（取り消しボタン表示用）
  timeLeft: number;
  isRunning: boolean;
  disabled?: boolean;
}

// 入力値から数字以外（カンマなど）を取り除いて数値化
function parseCoins(value: string): number {
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : NaN;
}

/**
 * 画面下部に固定するプレイ入力バー
 * スクロール位置に関係なく片手で素コインを記録できる
 */
export function PlayInput({
  onAddPlay,
  onUndo,
  lastRawCoins,
  timeLeft,
  isRunning,
  disabled = false,
}: PlayInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const coins = parseCoins(value);
  const isValid = !isNaN(coins) && coins > 0;

  // PCのみ自動フォーカス（スマホではキーボードが勝手に開かないように）
  useEffect(() => {
    if (!disabled && window.matchMedia('(pointer: fine)').matches) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onAddPlay(coins);
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-4xl mx-auto px-4 py-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            残り{' '}
            <span
              className={`font-mono font-bold ${isRunning ? 'text-sky-600 dark:text-sky-400' : ''}`}
            >
              {formatTime(timeLeft)}
            </span>
            {!isRunning && !disabled && (
              <span className="ml-2 text-amber-600 dark:text-amber-400">
                {timeLeft > 0 ? 'タイマー停止中' : ''}
              </span>
            )}
          </span>
          {onUndo && lastRawCoins !== undefined && (
            <button
              type="button"
              onClick={onUndo}
              className="flex items-center gap-1 hover:text-foreground"
            >
              <Undo2 className="w-3 h-3" />
              直前の {formatNumber(lastRawCoins)} を取り消す
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9,]*"
            enterKeyHint="done"
            autoComplete="off"
            aria-label="素コイン"
            placeholder={disabled ? 'タイマー終了' : '素コインを入力（例: 2500）'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            className="text-lg h-12"
          />
          <Button
            type="submit"
            disabled={disabled || !isValid}
            size="lg"
            className="h-12 px-6 bg-sky-500 hover:bg-sky-600 text-white"
          >
            <Plus className="w-5 h-5 mr-1" />
            追加
          </Button>
        </form>
      </div>
    </div>
  );
}
