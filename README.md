# ツムツム 30分効率計算機

LINE:ディズニー ツムツムのコイン稼ぎ効率を計算するWebアプリケーション。

## 機能

- 30分カウントダウンタイマー（バックグラウンド対応）
- プレイごとの素コイン記録
- リアルタイム効率計算（1分効率・30分効率）
- 使用ツム登録
- セッション保存・共有（LINE/クリップボード）
- モバイルブラウザ対応

## 技術スタック

- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **アイコン**: lucide-react
- **データ永続化**: localStorage

## 開発

### 必要環境

- Node.js 18+
- npm

### セットアップ

```bash
npm install
```

### 開発サーバー

```bash
npm run dev
```

http://localhost:3000 でアクセス

### ビルド

```bash
npm run build
```

### 本番起動

```bash
npm run start
```

## ディレクトリ構成

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn/ui
│   ├── Timer.tsx
│   ├── Settings.tsx
│   ├── PlayInput.tsx
│   ├── Statistics.tsx
│   ├── PlayHistory.tsx
│   └── SavedSessions.tsx
├── hooks/
│   ├── useTimer.ts
│   ├── useLocalStorage.ts
│   ├── useCalculator.ts
│   └── useSessions.ts
├── lib/
│   ├── utils.ts
│   └── calculator.ts
└── types/
    └── index.ts
```

## デプロイ

Vercelで環境変数なしでデプロイ可能。

```bash
vercel
```

## ライセンス

MIT
