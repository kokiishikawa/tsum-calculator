import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/calculator';
import { ITEM_COST_PRESETS, ITEM_PRICES } from '@/types';

/**
 * よくある質問（画面表示と構造化データの両方で使う）
 */
export const FAQ_ITEMS = [
	{
		question: 'ツムツムの30分効率とは何ですか？',
		answer:
			'30分間プレイし続けたときに、アイテム代を差し引いて実際に増えるコインの量です。ツムやアイテム構成ごとのコイン稼ぎ性能を比べる目安として使われます。',
	},
	{
		question: '30分効率はどうやって計算していますか？',
		answer:
			'各プレイの素コインに+Coin倍率を掛けて合計し、プレイ回数分のアイテム代を差し引いた実質コインを経過時間（分）で割って1分効率を出し、それを30倍しています。',
	},
	{
		question: '素コインとは何ですか？',
		answer:
			'+Coinなどのボーナスが付く前の、プレイ結果画面に表示される獲得コインです。この計算機には素コインを入力すると、倍率は自動で反映されます。',
	},
	{
		question: '30分経たなくても効率は分かりますか？',
		answer:
			'はい。途中でもその時点までのペースから30分効率を計算して表示します。短い時間で複数のツムを試して比べることもできます。',
	},
	{
		question: '記録は保存されますか？',
		answer:
			'記録や設定はお使いのブラウザ内に保存され、ページを閉じても残ります。サーバーには送信されません（ランキングに投稿した場合を除く）。',
	},
	{
		question: '料金はかかりますか？',
		answer: '無料で利用できます。登録やログインも不要です。',
	},
];

const STEPS = [
	'設定で使用ツム・+Coin倍率・使うアイテムを選ぶ',
	'タイマーをスタートしてツムツムをプレイ',
	'1プレイごとに結果画面の素コインを入力',
	'30分効率・1分効率がリアルタイムに更新される',
	'終わったらセッションを保存して、ツム別の成績やランキングで比較',
];

/**
 * ツール説明・使い方・FAQ（検索エンジンにページの内容を伝える役割も兼ねる）
 */
export function AboutGuide() {
	const presets = ITEM_COST_PRESETS.filter((preset) => preset.value > 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">ツムツムのコイン稼ぎ効率を自動計算</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6 text-sm leading-relaxed">
				<p>
					この計算機は、LINE:ディズニー ツムツムの<strong>30分効率</strong>
					（30分あたりに稼げるコイン）を自動で計算する無料ツールです。タイマーを動かしながら毎プレイの素コインを入力するだけで、
					+Coin倍率とアイテム代を差し引いた効率がその場で分かります。どのツム・どのアイテム構成がコイン稼ぎに向いているかの比較に使えます。
				</p>

				<section className="space-y-2">
					<h2 className="font-bold text-base">使い方</h2>
					<ol className="list-decimal pl-5 space-y-1">
						{STEPS.map((step) => (
							<li key={step}>{step}</li>
						))}
					</ol>
				</section>

				<section className="space-y-2">
					<h2 className="font-bold text-base">30分効率の計算方法</h2>
					<p className="rounded-md bg-muted px-3 py-2 font-mono text-xs md:text-sm">
						30分効率 ＝（素コイン × +Coin倍率 の合計 − アイテム代 × プレイ回数）÷ 経過分数 × 30
					</p>
					<p>
						+Coin倍率は初期値1.3倍です。コインボーナスなどで倍率が変わる場合は設定から変更できます。
					</p>
				</section>

				<section className="space-y-2">
					<h2 className="font-bold text-base">アイテムの価格（1プレイあたり）</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<table className="w-full">
							<caption className="text-left text-muted-foreground mb-1">アイテム単体</caption>
							<tbody>
								{ITEM_PRICES.map((item) => (
									<tr key={item.label} className="border-b last:border-0">
										<th scope="row" className="py-1 text-left font-normal">
											{item.label}
										</th>
										<td className="py-1 text-right font-mono">{formatNumber(item.value)}コイン</td>
									</tr>
								))}
							</tbody>
						</table>
						<table className="w-full">
							<caption className="text-left text-muted-foreground mb-1">よく使う組み合わせ</caption>
							<tbody>
								{presets.map((preset) => (
									<tr key={preset.label} className="border-b last:border-0">
										<th scope="row" className="py-1 text-left font-normal">
											{preset.label}
										</th>
										<td className="py-1 text-right font-mono">{formatNumber(preset.value)}コイン</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section className="space-y-2">
					<h2 className="font-bold text-base">よくある質問</h2>
					<dl className="space-y-3">
						{FAQ_ITEMS.map((item) => (
							<div key={item.question}>
								<dt className="font-medium">Q. {item.question}</dt>
								<dd className="text-muted-foreground mt-0.5">A. {item.answer}</dd>
							</div>
						))}
					</dl>
				</section>
			</CardContent>
		</Card>
	);
}
