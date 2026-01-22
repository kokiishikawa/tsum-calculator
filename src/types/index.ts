// types/index.ts - ツムツム30分効率計算機の型定義

/**
 * 1プレイの記録
 */
export interface Play {
  id: string;
  rawCoins: number;        // 素コイン
  timestamp: number;       // 記録時刻（Unix timestamp）
  elapsedTime: number;     // 記録時の経過秒数
}

/**
 * アプリ設定
 */
export interface Settings {
  coinMultiplier: number;  // +Coin倍率（デフォルト: 1.3）
  itemCost: number;        // 1プレイあたりのアイテムコスト
  usedTsum: string;        // 使用ツム名
}

/**
 * 統計情報
 */
export interface Statistics {
  playCount: number;          // プレイ回数
  totalRawCoins: number;      // 総素コイン
  totalEarnedCoins: number;   // 総獲得コイン（倍率適用後）
  totalItemCost: number;      // 総アイテムコスト
  netCoins: number;           // 実質獲得コイン
  averageCoins: number;       // 平均コイン/プレイ
  elapsedMinutes: number;     // 経過時間（分）
  efficiency1min: number;     // 1分効率
  efficiency30min: number;    // 30分効率
}

/**
 * タイマー状態
 */
export interface TimerState {
  timeLeft: number;           // 残り秒数
  isRunning: boolean;         // 実行中フラグ
  startTime: number | null;   // 開始時刻
}

/**
 * アイテムコストのプリセット
 */
export interface ItemCostPreset {
  label: string;
  value: number;
}

/**
 * アイテムコストプリセット一覧
 */
export const ITEM_COST_PRESETS: ItemCostPreset[] = [
  { label: '+Coin のみ', value: 500 },
  { label: '+Coin + 5→4', value: 2300 },
  { label: '+Coin + 5→4 + +Time', value: 3300 },
  { label: '+Coin + 5→4 + +Bomb', value: 3800 },
  { label: 'フルアイテム', value: 6300 },
  { label: 'カスタム', value: -1 }, // 状態を表すためvalueは-1
];

/**
 * デフォルト設定
 */
export const DEFAULT_SETTINGS: Settings = {
  coinMultiplier: 1.3,
  itemCost: 2300, // +Coin + 5→4
  usedTsum: '',   // 使用ツム（未設定）
};

/**
 * 保存されたセッション
 */
export interface SavedSession {
  id: string;
  savedAt: number;           // 保存日時（Unix timestamp）
  plays: Play[];             // プレイ履歴
  settings: Settings;        // 設定
  statistics: Statistics;    // 統計情報
  elapsedSeconds: number;    // 経過秒数
}
