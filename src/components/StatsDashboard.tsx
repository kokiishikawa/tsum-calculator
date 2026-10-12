'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useSessions } from '@/hooks';
import { calculateTsumStats, formatNumber, formatTime } from '@/lib/calculator';
import { AXIS_PROPS, ChartTooltip, GRID_PROPS, formatAxisCoins } from '@/components/charts';
import { BarChart3, Crown, FolderOpen, LineChart as LineChartIcon } from 'lucide-react';

const ALL_TSUMS = '__all__';
const NO_TSUM_LABEL = '(未設定)';

interface TrendPoint {
	index: number;
	dateLabel: string;
	savedAt: number;
	tsum: string;
	efficiency30min: number;
	playCount: number;
	elapsedSeconds: number;
}

function KpiTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
	return (
		<Card>
			<CardContent className="p-4">
				<p className="text-sm text-muted-foreground">{label}</p>
				<p className="text-2xl font-bold tabular-nums">{value}</p>
				{sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
			</CardContent>
		</Card>
	);
}

/**
 * 保存済みセッションの統計ダッシュボード
 */
export function StatsDashboard() {
	const { sessions } = useSessions();
	const [tsumFilter, setTsumFilter] = useState(ALL_TSUMS);

	const tsumStats = useMemo(() => calculateTsumStats(sessions), [sessions]);

	const filtered = useMemo(
		() =>
			tsumFilter === ALL_TSUMS
				? sessions
				: sessions.filter((s) => (s.settings.usedTsum ?? '').trim() === tsumFilter),
		[sessions, tsumFilter]
	);

	// 古い順に並べた推移データ
	const trend: TrendPoint[] = useMemo(
		() =>
			[...filtered]
				.sort((a, b) => a.savedAt - b.savedAt)
				.map((s, i) => {
					const date = new Date(s.savedAt);
					return {
						index: i + 1,
						dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
						savedAt: s.savedAt,
						tsum: (s.settings.usedTsum ?? '').trim(),
						efficiency30min: s.statistics.efficiency30min,
						playCount: s.statistics.playCount,
						elapsedSeconds: s.elapsedSeconds,
					};
				}),
		[filtered]
	);

	if (sessions.length === 0) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground space-y-3">
					<FolderOpen className="w-12 h-12 mx-auto opacity-30" />
					<p>保存済みのセッションがありません</p>
					<p className="text-sm">計測が終わったら「このセッションを保存」を押すと、ここに統計が表示されます</p>
					<Button asChild variant="outline">
						<Link href="/">計測をはじめる</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	const efficiencies = filtered.map((s) => s.statistics.efficiency30min);
	const best = Math.max(...efficiencies);
	const average = Math.round(efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length);
	const totalPlays = filtered.reduce((sum, s) => sum + s.statistics.playCount, 0);
	const averageRaw =
		totalPlays > 0
			? Math.round(filtered.reduce((sum, s) => sum + s.statistics.totalRawCoins, 0) / totalPlays)
			: 0;
	const recent = trend.slice(-5).map((p) => p.efficiency30min);
	const recentAverage = Math.round(recent.reduce((sum, e) => sum + e, 0) / recent.length);

	const renderTooltip = ({
		active,
		payload,
	}: {
		active?: boolean;
		payload?: ReadonlyArray<{ payload?: unknown }>;
	}) => {
		const point = payload?.[0]?.payload as TrendPoint | undefined;
		if (!point) return null;
		return (
			<ChartTooltip
				active={active}
				title={new Date(point.savedAt).toLocaleString('ja-JP', {
					month: 'numeric',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})}
				rows={[
					{ label: '30分効率', value: formatNumber(point.efficiency30min) },
					{ label: 'ツム', value: point.tsum || NO_TSUM_LABEL },
					{ label: 'プレイ', value: `${point.playCount}回` },
					{ label: '計測時間', value: formatTime(point.elapsedSeconds) },
				]}
			/>
		);
	};

	return (
		<div className="space-y-4">
			{/* ツム絞り込み */}
			<div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" role="tablist" aria-label="ツムで絞り込み">
				{[{ tsum: ALL_TSUMS }, ...tsumStats].map(({ tsum }) => (
					<Button
						key={tsum}
						role="tab"
						aria-selected={tsumFilter === tsum}
						size="sm"
						variant={tsumFilter === tsum ? 'default' : 'outline'}
						onClick={() => setTsumFilter(tsum)}
						className="flex-shrink-0"
					>
						{tsum === ALL_TSUMS ? 'すべて' : tsum || NO_TSUM_LABEL}
					</Button>
				))}
			</div>

			{/* KPI */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				<KpiTile label="自己ベスト" value={formatNumber(best)} sub="コイン / 30分" />
				<KpiTile label="平均30分効率" value={formatNumber(average)} sub={`${filtered.length}セッション`} />
				<KpiTile
					label="直近5回の平均"
					value={formatNumber(recentAverage)}
					sub={
						recentAverage >= average
							? `全体平均より +${formatNumber(recentAverage - average)}`
							: `全体平均より ${formatNumber(recentAverage - average)}`
					}
				/>
				<KpiTile label="平均素コイン" value={formatNumber(averageRaw)} sub="/ プレイ" />
			</div>

			{/* 推移グラフ */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-lg">
						<LineChartIcon className="w-5 h-5" />
						30分効率の推移
					</CardTitle>
				</CardHeader>
				<CardContent>
					{trend.length < 2 ? (
						<p className="text-sm text-muted-foreground py-8 text-center">
							セッションが2件以上になると推移グラフが表示されます
						</p>
					) : (
						<div className="h-60">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={trend} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
									<CartesianGrid {...GRID_PROPS} />
									<XAxis dataKey="dateLabel" {...AXIS_PROPS} minTickGap={16} />
									<YAxis width={48} tickFormatter={formatAxisCoins} {...AXIS_PROPS} />
									<Tooltip
										content={renderTooltip}
										cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '4 4' }}
									/>
									<Line
										dataKey="efficiency30min"
										stroke="var(--chart-mark)"
										strokeWidth={2}
										dot={{ r: 4, fill: 'var(--chart-mark)', stroke: 'var(--card)', strokeWidth: 2 }}
										activeDot={{ r: 6 }}
										isAnimationActive={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					)}
				</CardContent>
			</Card>

			{/* ツム別成績 */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-lg">
						<BarChart3 className="w-5 h-5" />
						ツム別成績
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ツム</TableHead>
									<TableHead className="text-right">回数</TableHead>
									<TableHead className="text-right">ベスト</TableHead>
									<TableHead className="text-right">平均</TableHead>
									<TableHead className="text-right">平均素コイン</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{tsumStats.map((row, i) => (
									<TableRow
										key={row.tsum}
										className="cursor-pointer"
										data-state={tsumFilter === row.tsum ? 'selected' : undefined}
										onClick={() => setTsumFilter(tsumFilter === row.tsum ? ALL_TSUMS : row.tsum)}
									>
										<TableCell className="font-medium">
											<span className="flex items-center gap-1">
												{i === 0 && <Crown className="w-4 h-4 text-yellow-500" aria-label="最高効率" />}
												{row.tsum || NO_TSUM_LABEL}
											</span>
										</TableCell>
										<TableCell className="text-right tabular-nums">{row.sessionCount}</TableCell>
										<TableCell className="text-right font-mono">{formatNumber(row.best30min)}</TableCell>
										<TableCell className="text-right font-mono">{formatNumber(row.average30min)}</TableCell>
										<TableCell className="text-right font-mono">{formatNumber(row.averageRawCoins)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					<p className="text-xs text-muted-foreground mt-2">
						行をタップするとそのツムで絞り込みます。30分未満で保存したセッションは30分換算の値です。
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
