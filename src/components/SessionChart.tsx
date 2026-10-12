'use client';

import { useMemo, useState } from 'react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Settings, TimelinePoint } from '@/types';
import { calculateTimeline, formatNumber, formatTime } from '@/lib/calculator';
import { AXIS_PROPS, ChartTooltip, GRID_PROPS, formatAxisCoins } from '@/components/charts';
import { LineChart as LineChartIcon } from 'lucide-react';

interface SessionChartProps {
	plays: Play[];
	settings: Settings;
	averageCoins: number;
}

type ChartMode = 'coins' | 'efficiency';

const CHART_MODES: { value: ChartMode; label: string }[] = [
	{ value: 'coins', label: '素コイン' },
	{ value: 'efficiency', label: '30分効率の推移' },
];

function tooltipRows(point: TimelinePoint) {
	return [
		{ label: '素コイン', value: formatNumber(point.rawCoins) },
		{ label: '実質', value: formatNumber(point.netCoins) },
		{ label: '経過', value: formatTime(point.elapsedTime) },
		{
			label: '30分効率',
			value: point.efficiency30min === null ? '-' : formatNumber(point.efficiency30min),
		},
	];
}

/**
 * 現在のセッションのプレイ推移グラフ
 */
export function SessionChart({ plays, settings, averageCoins }: SessionChartProps) {
	const [mode, setMode] = useState<ChartMode>('coins');
	const timeline = useMemo(() => calculateTimeline(plays, settings), [plays, settings]);

	// 2プレイ以上で推移として意味が出る
	if (plays.length < 2) return null;

	const renderTooltip = ({
		active,
		payload,
	}: {
		active?: boolean;
		payload?: ReadonlyArray<{ payload?: unknown }>;
	}) => {
		const point = payload?.[0]?.payload as TimelinePoint | undefined;
		return point ? (
			<ChartTooltip active={active} title={`${point.playNumber}回目`} rows={tooltipRows(point)} />
		) : null;
	};

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-lg">
					<LineChartIcon className="w-5 h-5" />
					プレイ推移
				</CardTitle>
				<div className="flex gap-2 pt-2" role="tablist">
					{CHART_MODES.map((m) => (
						<Button
							key={m.value}
							role="tab"
							aria-selected={mode === m.value}
							size="sm"
							variant={mode === m.value ? 'default' : 'outline'}
							onClick={() => setMode(m.value)}
						>
							{m.label}
						</Button>
					))}
				</div>
			</CardHeader>
			<CardContent>
				<div className="h-56">
					<ResponsiveContainer width="100%" height="100%">
						{mode === 'coins' ? (
							<BarChart data={timeline} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
								<CartesianGrid {...GRID_PROPS} />
								<XAxis dataKey="playNumber" {...AXIS_PROPS} />
								<YAxis width={48} tickFormatter={formatAxisCoins} {...AXIS_PROPS} />
								<Tooltip content={renderTooltip} cursor={{ fill: 'var(--muted)' }} />
								<Bar
									dataKey="rawCoins"
									fill="var(--chart-mark)"
									radius={[4, 4, 0, 0]}
									maxBarSize={32}
								/>
								<ReferenceLine
									y={averageCoins}
									stroke="var(--muted-foreground)"
									strokeDasharray="4 4"
									label={{
										value: `平均 ${formatNumber(averageCoins)}`,
										position: 'insideTopRight',
										fill: 'var(--muted-foreground)',
										fontSize: 12,
									}}
								/>
							</BarChart>
						) : (
							<LineChart data={timeline} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
								<CartesianGrid {...GRID_PROPS} />
								<XAxis dataKey="playNumber" {...AXIS_PROPS} />
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
									connectNulls
									isAnimationActive={false}
								/>
							</LineChart>
						)}
					</ResponsiveContainer>
				</div>
				<p className="text-xs text-muted-foreground mt-2">
					{mode === 'coins'
						? '横軸: プレイ回数 / 点線は平均素コイン'
						: '横軸: プレイ回数 / 各プレイ記録時点での30分効率（序盤はブレが大きくなります）'}
				</p>
			</CardContent>
		</Card>
	);
}
