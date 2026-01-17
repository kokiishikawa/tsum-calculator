'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings as SettingsIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Settings as SettingsType, ITEM_COST_PRESETS } from '@/types';
import { formatNumber } from '@/lib/calculator';

interface SettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
}

export function Settings({ settings, onUpdateSettings }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomCost, setIsCustomCost] = useState(
    !ITEM_COST_PRESETS.some(
      (p) => p.value === settings.itemCost && p.value !== -1
    )
  );

  const handleMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 1.0 && value <= 2.0) {
      onUpdateSettings({ coinMultiplier: value });
    }
  };

  const handlePresetChange = (value: string) => {
    const preset = ITEM_COST_PRESETS.find((p) => p.label === value);
    if (preset) {
      if (preset.value === -1) {
        setIsCustomCost(true);
      } else {
        setIsCustomCost(false);
        onUpdateSettings({ itemCost: preset.value });
      }
    }
  };

  const handleCustomCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      onUpdateSettings({ itemCost: value });
    }
  };

  const currentPreset = ITEM_COST_PRESETS.find(
    (p) => p.value === settings.itemCost
  );

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            設定
          </span>
          <span className="text-sm font-normal text-muted-foreground flex items-center gap-2">
            倍率: {settings.coinMultiplier}x / コスト: {formatNumber(settings.itemCost)}
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </CardTitle>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4">
          {/* +Coin倍率設定 */}
          <div className="space-y-2">
            <Label htmlFor="multiplier">+Coin 倍率</Label>
            <div className="flex items-center gap-2">
              <Input
                id="multiplier"
                type="number"
                min="1.0"
                max="2.0"
                step="0.1"
                value={settings.coinMultiplier}
                onChange={handleMultiplierChange}
                className="w-24"
              />
              <span className="text-muted-foreground">倍</span>
            </div>
            <p className="text-xs text-muted-foreground">
              +Coinアイテムの平均倍率（1.0〜2.0）
            </p>
          </div>

          {/* アイテムコスト設定 */}
          <div className="space-y-2">
            <Label>アイテムコスト（1プレイあたり）</Label>
            <Select
              value={isCustomCost ? 'カスタム' : currentPreset?.label || 'カスタム'}
              onValueChange={handlePresetChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="アイテムを選択" />
              </SelectTrigger>
              <SelectContent>
                {ITEM_COST_PRESETS.map((preset) => (
                  <SelectItem key={preset.label} value={preset.label}>
                    {preset.label}
                    {preset.value !== -1 && ` (${formatNumber(preset.value)})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isCustomCost && (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={settings.itemCost}
                  onChange={handleCustomCostChange}
                  className="w-32"
                />
                <span className="text-muted-foreground">コイン</span>
              </div>
            )}
          </div>

          {/* アイテムコスト参考 */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p className="font-medium">参考: 各アイテムのコスト</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>+Coin: 500</li>
              <li>5→4: 1,800</li>
              <li>+Time: 1,000</li>
              <li>+Bomb: 1,500</li>
              <li>+Score: 1,500</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
