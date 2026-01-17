'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PlayInputProps {
  onAddPlay: (rawCoins: number) => void;
  disabled?: boolean;
}

export function PlayInput({ onAddPlay, disabled = false }: PlayInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 自動フォーカス
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const coins = parseInt(value, 10);
    if (!isNaN(coins) && coins > 0) {
      onAddPlay(coins);
      setValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Input
              ref={inputRef}
              type="number"
              placeholder="素コインを入力（例: 2500）"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              min="1"
              className="text-lg h-12"
            />
          </div>
          <Button
            type="submit"
            disabled={disabled || !value || parseInt(value, 10) <= 0}
            size="lg"
            className="h-12 px-6 bg-sky-500 hover:bg-sky-600"
          >
            <Plus className="w-5 h-5 mr-1" />
            追加
          </Button>
        </form>
        {disabled && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            タイマーが終了しました。リセットして新しいセッションを開始してください。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
