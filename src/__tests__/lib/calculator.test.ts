import {
  calculateEarnedCoins,
  calculateEfficiency30min,
  calculateStatistics,
  calculateTimeline,
  calculateTsumStats,
  formatNumber,
  formatTime,
  getItemCostLabel,
} from '@/lib/calculator';
import { buildShareText } from '@/lib/share';
import { ITEM_COST_PRESETS, ITEM_PRICES, Play, SavedSession, Settings } from '@/types';

const SETTINGS: Settings = { coinMultiplier: 1.3, itemCost: 2300, usedTsum: '' };

function makePlay(rawCoins: number, elapsedTime: number): Play {
  return { id: `${rawCoins}-${elapsedTime}`, rawCoins, elapsedTime, timestamp: 0 };
}

describe('calculateStatistics', () => {
  it('プレイなし・経過0秒ならすべて0', () => {
    const stats = calculateStatistics([], SETTINGS, 0);
    expect(stats).toEqual({
      playCount: 0,
      totalRawCoins: 0,
      totalEarnedCoins: 0,
      totalItemCost: 0,
      netCoins: 0,
      averageCoins: 0,
      elapsedMinutes: 0,
      efficiency1min: 0,
      efficiency30min: 0,
    });
  });

  it('README記載の計算式どおりに計算する', () => {
    // 素コイン 3,000 × 10回、15分経過
    const plays = Array.from({ length: 10 }, (_, i) => makePlay(3000, (i + 1) * 90));
    const stats = calculateStatistics(plays, SETTINGS, 900);

    expect(stats.totalRawCoins).toBe(30000);
    expect(stats.totalEarnedCoins).toBe(39000); // 30,000 × 1.3
    expect(stats.totalItemCost).toBe(23000); // 10回 × 2,300
    expect(stats.netCoins).toBe(16000);
    expect(stats.elapsedMinutes).toBe(15);
    expect(stats.efficiency1min).toBe(1067); // 16,000 / 15 = 1066.66...
    expect(stats.efficiency30min).toBe(32000); // 丸める前の1分効率 × 30
    expect(stats.averageCoins).toBe(3000);
  });

  it('30分効率は丸めた1分効率の30倍ではなく正確な値になる', () => {
    const stats = calculateStatistics([makePlay(3000, 60)], SETTINGS, 900);
    // net = 3900 - 2300 = 1600, 1600 / 15 * 30 = 3200
    expect(stats.efficiency30min).toBe(3200);
    expect(stats.efficiency1min * 30).not.toBe(3200);
  });

  it('獲得コインはプレイ単位で丸めて合計する（履歴テーブルの合計と一致）', () => {
    // 1,001 × 1.3 = 1,301.3 → 1,301 を3回 = 3,903（合計してから丸めると3,904）
    const plays = [makePlay(1001, 60), makePlay(1001, 120), makePlay(1001, 180)];
    const stats = calculateStatistics(plays, SETTINGS, 180);
    const tableSum = plays.reduce(
      (sum, p) => sum + calculateEarnedCoins(p.rawCoins, SETTINGS.coinMultiplier),
      0
    );
    expect(stats.totalEarnedCoins).toBe(3903);
    expect(stats.totalEarnedCoins).toBe(tableSum);
  });

  it('浮動小数点誤差があっても正しく丸める', () => {
    // 2500 * 1.3 = 3250.0000000000005
    expect(calculateEarnedCoins(2500, 1.3)).toBe(3250);
  });

  it('アイテムコストが獲得を上回るとマイナス効率になる', () => {
    const stats = calculateStatistics([makePlay(1000, 60)], SETTINGS, 60);
    expect(stats.netCoins).toBe(-1000);
    expect(stats.efficiency30min).toBe(-30000);
  });

  it('タイマー未開始（経過0秒）なら効率は0', () => {
    const stats = calculateStatistics([makePlay(3000, 0)], SETTINGS, 0);
    expect(stats.netCoins).toBe(1600);
    expect(stats.efficiency1min).toBe(0);
    expect(stats.efficiency30min).toBe(0);
  });
});

describe('calculateEfficiency30min', () => {
  it('30分ちょうどなら実質コインと同じ', () => {
    expect(calculateEfficiency30min(50000, 1800)).toBe(50000);
  });
  it('経過0秒なら0', () => {
    expect(calculateEfficiency30min(50000, 0)).toBe(0);
  });
});

describe('calculateTimeline', () => {
  it('累計実質コインとその時点の30分効率を計算する', () => {
    const timeline = calculateTimeline([makePlay(3000, 90), makePlay(4000, 180)], SETTINGS);
    expect(timeline).toEqual([
      {
        playNumber: 1,
        rawCoins: 3000,
        earnedCoins: 3900,
        netCoins: 1600,
        cumulativeNetCoins: 1600,
        elapsedTime: 90,
        efficiency30min: 32000,
      },
      {
        playNumber: 2,
        rawCoins: 4000,
        earnedCoins: 5200,
        netCoins: 2900,
        cumulativeNetCoins: 4500,
        elapsedTime: 180,
        efficiency30min: 45000,
      },
    ]);
  });

  it('経過0秒で記録したプレイの効率はnull', () => {
    expect(calculateTimeline([makePlay(3000, 0)], SETTINGS)[0].efficiency30min).toBeNull();
  });
});

describe('calculateTsumStats', () => {
  function makeSession(usedTsum: string, efficiency30min: number, playCount = 10): SavedSession {
    const settings = { ...SETTINGS, usedTsum };
    const plays = Array.from({ length: playCount }, (_, i) => makePlay(3000, i * 90));
    return {
      id: `${usedTsum}-${efficiency30min}`,
      savedAt: 0,
      plays,
      settings,
      statistics: { ...calculateStatistics(plays, settings, 1800), efficiency30min },
      elapsedSeconds: 1800,
    };
  }

  it('ツムごとにベスト・平均を集計し、ベストの高い順に並べる', () => {
    const result = calculateTsumStats([
      makeSession('ガストン', 40000),
      makeSession('ナミネ', 50000),
      makeSession('ガストン', 30000),
      makeSession(' ガストン ', 20000), // 前後の空白は同一ツム扱い
    ]);
    expect(result.map((r) => r.tsum)).toEqual(['ナミネ', 'ガストン']);
    expect(result[1]).toMatchObject({
      sessionCount: 3,
      best30min: 40000,
      average30min: 30000,
      averageRawCoins: 3000,
    });
  });

  it('旧データでusedTsumが無くても集計できる', () => {
    const session = makeSession('', 10000);
    // @ts-expect-error 旧バージョンのデータを再現
    delete session.settings.usedTsum;
    expect(calculateTsumStats([session])[0].tsum).toBe('');
  });
});

describe('アイテムコストのプリセット', () => {
  const price = (label: string) => ITEM_PRICES.find((p) => p.label === label)!.value;
  const preset = (label: string) => ITEM_COST_PRESETS.find((p) => p.label === label)!.value;

  it('プリセットの金額が単体アイテムの合計と一致する', () => {
    expect(preset('+Coin のみ')).toBe(price('+Coin'));
    expect(preset('+Coin + 5→4')).toBe(price('+Coin') + price('5→4'));
    expect(preset('+Coin + 5→4 + +Time')).toBe(price('+Coin') + price('5→4') + price('+Time'));
    expect(preset('+Coin + 5→4 + +Bomb')).toBe(price('+Coin') + price('5→4') + price('+Bomb'));
    expect(preset('フルアイテム')).toBe(
      ITEM_PRICES.reduce((sum, p) => sum + p.value, 0)
    );
  });
});

describe('フォーマット', () => {
  it('formatNumber は3桁区切り', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(-1234.6)).toBe('-1,235');
  });

  it('formatTime は MM:SS', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(1800)).toBe('30:00');
    expect(formatTime(65.7)).toBe('01:05');
    expect(formatTime(-5)).toBe('00:00');
  });

  it('getItemCostLabel はプリセット名か金額を返す', () => {
    expect(getItemCostLabel(2300)).toBe('+Coin + 5→4');
    expect(getItemCostLabel(1234)).toBe('1,234コイン');
  });
});

describe('buildShareText', () => {
  it('使用ツムと結果を含む', () => {
    const plays = [makePlay(3000, 90)];
    const settings = { ...SETTINGS, usedTsum: 'ガストン' };
    const text = buildShareText({
      plays,
      settings,
      statistics: calculateStatistics(plays, settings, 90),
      elapsedSeconds: 90,
    });
    expect(text).toContain('使用ツム: ガストン');
    expect(text).toContain('30分効率: 32,000 コイン');
    expect(text).toContain('経過時間: 01:30');
    expect(text).toContain('1回目: 3,000 → 3,900');
  });
});
