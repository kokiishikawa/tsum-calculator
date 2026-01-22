# Component Patterns

## Client Component
- 状態を持つコンポーネントには `"use client"` を付ける
- 参考: `components/PlayInput.tsx`

## カスタムフック
- ファイル名: `use` + 機能名（camelCase）
- 配置: `hooks/` ディレクトリ
- 戻り値の型を明示する
- 参考: `hooks/useTimer.ts`

## localStorage
- 必ず `useLocalStorage` フック経由で使用
- 直接 `localStorage.setItem()` は使わない
- 参考: `hooks/useLocalStorage.ts`

## 新規コンポーネント作成チェックリスト
- [ ] TypeScript で記述
- [ ] 状態を持つなら `"use client"` を追加
- [ ] Props の型定義
- [ ] ファイル名は PascalCase
- [ ] 必要なら `types/index.ts` に型を追加