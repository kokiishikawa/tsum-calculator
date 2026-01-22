# Tsum Tsum Calculator

## Overview

LINE:ディズニー ツムツムのコイン稼ぎ効率を計算するWebアプリケーション。
タイマーとプレイ記録を一画面で管理し、30分効率をリアルタイム計算。

**現在の状態**: プロトタイプ完成、機能追加・改善フェーズ

## Tech Stack

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- UI: shadcn/ui
- State: React Hooks + localStorage

## プロジェクト構成

### ディレクトリ構成

```
tsum-calculator/
├── CLAUDE.md               # このファイル
├── .claude/
│   ├── skills/             # スキル定義
│   └── hooks/              # フック（実行可能スクリプト）
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # メインページ
│   └── globals.css
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── Timer.tsx           # タイマー
│   ├── Settings.tsx        # 設定（+Coin倍率、アイテムコスト）
│   ├── PlayInput.tsx       # プレイ記録入力
│   ├── Statistics.tsx      # 統計表示
│   └── PlayHistory.tsx     # 履歴テーブル
├── lib/
│   ├── utils.ts
│   └── calculator.ts       # 30分効率計算ロジック
├── types/
│   └── index.ts            # Play, Settings, Statistics型
└── hooks/
    ├── useTimer.ts         # タイマーロジック
    ├── useLocalStorage.ts  # データ永続化
    └── useCalculator.ts    # 計算・統計ロジック
```

### 主要ファイルの役割

- `lib/calculator.ts` - **最重要**: 30分効率の計算ロジック
- `hooks/useCalculator.ts` - プレイ記録の状態管理
- `hooks/useTimer.ts` - 30分カウントダウンタイマー
- `components/Statistics.tsx` - 30分効率などの統計表示

## Commands

### dev

開発サーバー起動

```bash
npm run dev
```

### build

本番ビルド

```bash
npm run build
```

### lint

Lintチェック

```bash
npm run lint
```

### lint:fix

Lint自動修正

```bash
npm run lint -- --fix
```

## Development Guidelines

### コーディング規約

- すべてのコンポーネントはTypeScriptで記述
- Client Componentには "use client" を明記
- 状態管理ロジックはカスタムフックに切り出す
- データ永続化はlocalStorageを使用
- 変数名はキャメルケースを使用
- 定数名は全て大文字で宣言

### 命名規則

- Components: PascalCase (`Timer.tsx`)
- Hooks: camelCase + `use` prefix (`useTimer.ts`)
- Types: PascalCase (`PlayRecord`, `Statistics`)

### 型定義

共通の型は `types/index.ts` に定義：

- `Play` - プレイ記録
- `Settings` - +Coin倍率、アイテムコスト
- `Statistics` - 計算結果（30分効率など）

## 計算ロジックの理解

### 30分効率の計算フロー

1. 各プレイの素コインを合計
2. +Coin倍率（デフォルト1.3倍）を適用
3. 使用アイテムコストを差し引く
4. 経過時間（分）で割る → **1分効率**
5. 1分効率 × 30 → **30分効率**

実装は `lib/calculator.ts` の `calculateStatistics()` を参照

### アイテムコスト設定

プリセット：

- +Coin のみ: 500
- +Coin + 5→4: 2,300
- +Coin + 5→4 + +Time: 3,300
- フルアイテム: 6,300
- カスタム: ユーザー入力可

## 現在の開発状況

### 完成している機能

- ✅ 30分カウントダウンタイマー
- ✅ プレイ記録の追加・削除
- ✅ 30分効率のリアルタイム計算
- ✅ localStorageでのデータ保存
- ✅ レスポンシブデザイン

### よくある作業パターン

**新しいコンポーネントを追加**:

1. `components/` にファイル作成
2. 必要なら型を `types/index.ts` に追加
3. `app/page.tsx` でインポート

**計算ロジックを修正**:

1. `lib/calculator.ts` を編集
2. 型定義が変わったら `types/index.ts` も更新
3. 影響を受けるコンポーネントを確認

**新しい設定項目を追加**:

1. `types/index.ts` の `Settings` 型に追加
2. `components/Settings.tsx` にUI追加
3. `hooks/useCalculator.ts` のデフォルト値設定

## データ構造

### Play型 1プレイの記録

```typescript
{
	id: string;
	rawCoins: number; // 素コイン
	timestamp: number; // 記録時刻（Unix timestamp）
	elapsedTime: number; // 記録時の経過秒数
}
```

### Settings型 アプリ設定

```typescript
{
	coinMultiplier: number; // +Coin倍率（デフォルト: 1.3）
	itemCost: number; // 1プレイあたりのアイテムコスト
	usedTsum: string; // 使用ツム名
}
```

### Statistics型 統計情報

```typescript
{
	playCount: number; // プレイ回数
	totalRawCoins: number; // 総素コイン
	totalEarnedCoins: number; // 総獲得コイン（倍率適用後）
	totalItemCost: number; // 総アイテムコスト
	netCoins: number; // 実質獲得コイン
	averageCoins: number; // 平均コイン/プレイ
	elapsedMinutes: number; // 経過時間（分）
	efficiency1min: number; // 1分効率
	efficiency30min: number; // 30分効率
}
```

### TimerState型 タイマー状態

```typescript
{
	timeLeft: number; // 残り秒数
	isRunning: boolean; // 実行中フラグ
	startTime: number | null; // 開始時刻
}
```

### ItemCostPreset型 アイテムコストのプリセット

```typescript
{
	label: string;
	value: number;
}
```

### ITEM_COST_PRESETS アイテムプリセット一覧

```typescript
ItemCostPreset[] = [
  { label: '+Coin のみ', value: 500 },
  { label: '+Coin + 5→4', value: 2300 },
  { label: '+Coin + 5→4 + +Time', value: 3300 },
  { label: '+Coin + 5→4 + +Bomb', value: 3800 },
  { label: 'フルアイテム', value: 6300 },
  { label: 'カスタム', value: -1 }, // 状態を表すためvalueは-1
]
```

### DEFAULT_SETTINGS デフォルト設定

```typescript
Settings = {
	coinMultiplier: 1.3,
	itemCost: 2300, // +Coin + 5→4
	usedTsum: '', // 使用ツム（未設定）
};
```

### SavedSession型 保存されたセッション

```typescript
{
  id: string;
  savedAt: number;           // 保存日時（Unix timestamp）
  plays: Play[];             // プレイ履歴
  settings: Settings;        // 設定
  statistics: Statistics;    // 統計情報
  elapsedSeconds: number;    // 経過秒数
}
```

## 詳細仕様

完全な仕様、計算式、UI設計は `docs/requirements.md` を参照

## Notes

- データはlocalStorageに保存（ブラウザ間で共有されない）
- バックエンドなし、完全にフロントエンド
- 将来的にPWA化を検討