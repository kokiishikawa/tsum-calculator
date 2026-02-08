# Tsum Calculator - ポートフォリオ情報

## プロジェクト概要

LINE:ディズニー ツムツムのコイン稼ぎ効率をリアルタイムで計算するWebアプリケーション。
30分カウントダウンタイマーとプレイ記録を一画面で管理し、1分効率・30分効率を自動計算します。

**開発期間**: 個人開発
**種別**: フロントエンド完結型Webアプリケーション

---

## リンク

| 項目 | URL |
|------|-----|
| デモサイト | `[Vercel URL をここに記載]` |
| GitHub | `[GitHub URL をここに記載]` |

---

## 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.x | フレームワーク（App Router） |
| React | 19.x | UIライブラリ |
| TypeScript | 5.x | 型安全な開発 |
| Tailwind CSS | 4.x | スタイリング |
| shadcn/ui | - | UIコンポーネント（Radix UIベース） |
| lucide-react | 0.562.x | アイコン |

### 開発・テスト

| 技術 | 用途 |
|------|------|
| Jest | テストフレームワーク |
| @testing-library/react | Reactコンポーネントテスト |
| ESLint | コード品質管理 |

### インフラ

| 技術 | 用途 |
|------|------|
| Vercel | ホスティング・デプロイ |
| localStorage | データ永続化（バックエンド不要） |

---

## 主な機能

### 1. 30分カウントダウンタイマー
- バックグラウンド対応（ブラウザ非表示時も正確に計測）
- 開始・一時停止・リセット機能
- 経過時間のリアルタイム表示

### 2. プレイ記録管理
- 素コイン入力による記録追加
- 記録時の経過時間を自動保存
- 個別削除・一括削除機能

### 3. 効率計算（リアルタイム）
- **30分効率**: メイン指標として大きく表示
- **1分効率**: 比較用のサブ指標
- +Coin倍率・アイテムコストを考慮した実質獲得コイン計算

### 4. 設定機能
- +Coin倍率（1.0〜2.0倍）のカスタマイズ
- アイテムコストのプリセット選択（5種類）+ カスタム入力
- 使用ツム名の登録

### 5. セッション保存
- 計測結果をセッションとして保存
- 過去のセッション一覧表示・詳細確認
- セッション単位での削除

### 6. 共有機能
- Web Share API（モバイル対応）
- クリップボードコピー
- LINE共有

---

## 技術的なアピールポイント

### 1. バックグラウンド対応タイマーの実装

**課題**: ブラウザがバックグラウンドに移動すると `setInterval` が不正確になる問題

**解決策**:
- タイムスタンプベースの時間計算（`Date.now()`を基準に経過時間を算出）
- Page Visibility APIでページ復帰時に同期
- Focusイベントでウィンドウ復帰時に表示を更新

```typescript
// 実装例（useTimer.ts より抜粋）
const calculateElapsed = useCallback(() => {
  if (!isRunning || startTime === null) return pausedElapsed;
  const now = Date.now();
  const elapsed = pausedElapsed + Math.floor((now - startTime) / 1000);
  return Math.min(elapsed, initialSeconds);
}, [isRunning, startTime, pausedElapsed, initialSeconds]);
```

### 2. SSR対応のlocalStorageフック

**課題**: Next.js App RouterでのSSR時にlocalStorageにアクセスするとハイドレーションエラーが発生

**解決策**:
- 初期値でハイドレーションを揃える
- `useEffect`でマウント後にlocalStorageから読み込む

```typescript
// 実装例（useLocalStorage.ts より抜粋）
const [storedValue, setStoredValue] = useState<T>(initialValue);

useEffect(() => {
  const item = window.localStorage.getItem(key);
  if (item) {
    setStoredValue(JSON.parse(item) as T);
  }
}, [key]);
```

### 3. 責務分離されたカスタムフック設計

4つのカスタムフックで状態管理を明確に分離：

| フック | 責務 |
|--------|------|
| `useTimer` | タイマーロジック（開始・停止・リセット） |
| `useCalculator` | プレイ記録と統計計算 |
| `useLocalStorage` | データ永続化の汎用フック |
| `useSessions` | セッション保存・読み込み |

### 4. メモ化による計算最適化

```typescript
// 依存値が変わったときだけ再計算
const statistics = useMemo(() => {
  return calculateStatistics(plays, settings, elapsedSeconds);
}, [plays, settings, elapsedSeconds]);
```

### 5. 完全な型定義

TypeScriptで全てのデータ構造を型定義し、開発効率とバグ防止を実現：

```typescript
interface Play {
  id: string;
  rawCoins: number;
  timestamp: number;
  elapsedTime: number;
}

interface Statistics {
  playCount: number;
  totalRawCoins: number;
  totalEarnedCoins: number;
  totalItemCost: number;
  netCoins: number;
  averageCoins: number;
  elapsedMinutes: number;
  efficiency1min: number;
  efficiency30min: number;
}
```

### 6. アクセシビリティ対応

- Radix UIベースのshadcn/uiでWCAG準拠
- キーボード操作対応（Enterキーでの送信など）
- 適切なコントラスト比の色設計

---

## アーキテクチャ

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # メインページ
│   └── globals.css
├── components/
│   ├── ui/                 # shadcn/ui コンポーネント
│   ├── Timer.tsx           # タイマー表示
│   ├── Settings.tsx        # 設定パネル
│   ├── PlayInput.tsx       # 記録入力フォーム
│   ├── Statistics.tsx      # 統計表示
│   ├── PlayHistory.tsx     # 履歴テーブル
│   └── SavedSessions.tsx   # セッション管理
├── hooks/
│   ├── useTimer.ts         # タイマーロジック
│   ├── useCalculator.ts    # 計算ロジック
│   ├── useLocalStorage.ts  # データ永続化
│   └── useSessions.ts      # セッション管理
├── lib/
│   ├── calculator.ts       # 計算関数
│   └── utils.ts            # ユーティリティ
└── types/
    └── index.ts            # 型定義
```

---

## スクリーンショット

### メイン画面
`[スクリーンショットをここに追加]`

### タイマー動作中
`[スクリーンショットをここに追加]`

### 設定パネル
`[スクリーンショットをここに追加]`

### セッション保存
`[スクリーンショットをここに追加]`

### モバイル表示
`[スクリーンショットをここに追加]`

---

## 開発で意識した点

### ユーザー体験
- **モバイルファースト**: スマートフォンでの片手操作を想定した設計
- **リアルタイム更新**: 入力即座に効率値が更新される体験
- **視覚的フィードバック**: ボタン状態、タイマー終了時のアニメーション

### コード品質
- **TypeScript**: 全コード型安全
- **ESLint**: コード規約の自動チェック
- **責務分離**: コンポーネントとロジックの明確な分離

### 保守性
- **日本語コメント**: 実装意図を明記
- **CLAUDE.md**: プロジェクト情報を一元管理
- **テスト基盤**: Jest + Testing Libraryの環境構築済み

---

## 今後の拡張予定

- [ ] PWA化（オフライン対応）
- [ ] ダークモード対応
- [ ] テストコードの充実
- [ ] グラフによる効率推移の可視化

---

## 学んだこと・得られた知見

1. **Next.js App RouterでのSSR対応**: クライアントサイドAPIの適切な扱い方
2. **バックグラウンド処理の制約**: ブラウザのバックグラウンド制限への対処法
3. **React Hooksの設計パターン**: カスタムフックによる責務分離の重要性
4. **TypeScriptの型設計**: インターフェースによるドメインモデルの表現
5. **Tailwind CSSの実践**: レスポンシブデザインの効率的な実装

---

## 補足情報

### 計算ロジックの詳細

```
1. 総素コイン = Σ(各プレイの rawCoins)
2. 総獲得コイン = 総素コイン × coinMultiplier
3. 実質獲得 = 総獲得コイン - (プレイ数 × itemCost)
4. 1分効率 = 実質獲得 / 経過時間（分）
5. 30分効率 = 1分効率 × 30
```

### アイテムコストプリセット

| プリセット名 | コスト |
|-------------|--------|
| +Coin のみ | 500 |
| +Coin + 5→4 | 2,300 |
| +Coin + 5→4 + +Time | 3,300 |
| +Coin + 5→4 + +Bomb | 3,800 |
| フルアイテム | 6,300 |
