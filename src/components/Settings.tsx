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
import { Settings as SettingsType, ITEM_COST_PRESETS, ITEM_PRICES } from '@/types';
import { formatNumber } from '@/lib/calculator';

interface SettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
}

export function Settings({ settings, onUpdateSettings }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  // カスタムを明示的に選んだか（プリセットと同額でもカスタム入力欄を出すため）
  const [customSelected, setCustomSelected] = useState(false);
  // 入力途中の倍率（"1." など）を保持する
  const [multiplierDraft, setMultiplierDraft] = useState<string | null>(null);

  const currentPreset = ITEM_COST_PRESETS.find(
    (p) => p.value === settings.itemCost && p.value !== -1
  );
  // 保存値がどのプリセットにも一致しなければカスタム扱い
  const isCustomCost = customSelected || !currentPreset;

  const handleMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMultiplierDraft(e.target.value);
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 1.0 && value <= 2.0) {
      onUpdateSettings({ coinMultiplier: value });
    }
  };

  const handlePresetChange = (value: string) => {
    const preset = ITEM_COST_PRESETS.find((p) => p.label === value);
    if (preset) {
      if (preset.value === -1) {
        setCustomSelected(true);
      } else {
        setCustomSelected(false);
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
          <span className="text-xs md:text-sm font-normal text-muted-foreground flex items-center gap-2 text-right">
            {settings.usedTsum ? `${settings.usedTsum} / ` : ''}倍率: {settings.coinMultiplier}x / コスト: {formatNumber(settings.itemCost)}
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
          {/* 使用ツム設定 */}
          <div className="space-y-2">
            <Label htmlFor="usedTsum">使用ツム</Label>
            <Input
              id="usedTsum"
              type="text"
              placeholder="例: ガストン、ナミネ"
              value={settings.usedTsum ?? ''}
              onChange={(e) => onUpdateSettings({ usedTsum: e.target.value })}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              セッションで使用するツム名を入力
            </p>
          </div>

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
                inputMode="decimal"
                value={multiplierDraft ?? settings.coinMultiplier}
                onChange={handleMultiplierChange}
                onBlur={() => setMultiplierDraft(null)}
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
              value={isCustomCost ? 'カスタム' : currentPreset.label}
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
                  inputMode="numeric"
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
              {ITEM_PRICES.map((item) => (
                <li key={item.label}>
                  {item.label}: {formatNumber(item.value)}
                </li>
              ))}
            </ul>
            <p>※ 設定を変更すると、記録済みのプレイも含めて再計算されます</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
