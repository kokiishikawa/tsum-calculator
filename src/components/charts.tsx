'use client';

// グラフ共通の部品（Recharts用）

import { formatNumber } from '@/lib/calculator';

export const AXIS_PROPS = {
	stroke: 'var(--muted-foreground)',
	tick: { fill: 'var(--muted-foreground)', fontSize: 12 },
	tickLine: false,
	axisLine: false,
} as const;

export const GRID_PROPS = {
	stroke: 'var(--chart-grid)',
	vertical: false,
} as const;

/**
 * Y軸の目盛りを短く表示（例: 32000 → 3.2万）
 */
export function formatAxisCoins(value: number): string {
	if (Math.abs(value) >= 10000) {
		return `${(value / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万`;
	}
	return formatNumber(value);
}

interface TooltipRow {
	label: string;
	value: string;
}

interface ChartTooltipProps {
	active?: boolean;
	title?: string;
	rows: TooltipRow[];
}

/**
 * ホバー時のツールチップ
 */
export function ChartTooltip({ active, title, rows }: ChartTooltipProps) {
	if (!active || rows.length === 0) return null;
	return (
		<div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md text-popover-foreground">
			{title && <p className="font-medium mb-1">{title}</p>}
			{rows.map((row) => (
				<div key={row.label} className="flex justify-between gap-4">
					<span className="text-muted-foreground">{row.label}</span>
					<span className="font-mono font-medium">{row.value}</span>
				</div>
			))}
		</div>
	);
}
