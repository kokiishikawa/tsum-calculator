'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRanking } from '@/hooks';
import { formatNumber, formatTime, getItemCostLabel } from '@/lib/calculator';
import { Trophy, Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

// ひらがな→カタカナに正規化（部分一致検索用）
function toKatakana(str: string): string {
	return str.replace(/[\u3041-\u3096]/g, (ch) =>
		String.fromCharCode(ch.charCodeAt(0) + 0x60),
	);
}

function matchesTsum(entryTsum: string, filter: string): boolean {
	const normalizedEntry = toKatakana(entryTsum).toLowerCase();
	const normalizedFilter = toKatakana(filter).toLowerCase();
	return normalizedEntry.includes(normalizedFilter);
}

export function RankingBoard() {
	const { rankings, isLoading, error, hasMore, fetchRankings } = useRanking();
	const [tsumFilter, setTsumFilter] = useState('');
	const [searchInput, setSearchInput] = useState('');
	const [expandedId, setExpandedId] = useState<string | null>(null);

	// 初回ロード
	useEffect(() => {
		fetchRankings();
	}, [fetchRankings]);

	// ツム名で絞り込み（クライアント側フィルタリング）
	const handleSearch = () => {
		setTsumFilter(searchInput.trim());
	};

	// フィルタークリア
	const handleClearFilter = () => {
		setSearchInput('');
		setTsumFilter('');
	};

	// もっと見る
	const handleLoadMore = () => {
		fetchRankings({
			offset: rankings.length,
			reset: false,
		});
	};

	// フィルター適用
	const filteredRankings = tsumFilter
		? rankings.filter((entry) => matchesTsum(entry.used_tsum, tsumFilter))
		: rankings;

	const toggleExpand = (id: string) => {
		setExpandedId(expandedId === id ? null : id);
	};

	// 順位のメダル表示
	const getRankDisplay = (index: number) => {
		if (index === 0) return <span className="text-2xl">🥇</span>;
		if (index === 1) return <span className="text-2xl">🥈</span>;
		if (index === 2) return <span className="text-2xl">🥉</span>;
		return (
			<span className="text-lg font-bold text-muted-foreground">
				{index + 1}
			</span>
		);
	};

	return (
		<div className="space-y-4">
			{/* 検索バー */}
			<div className="flex gap-2">
				<Input
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					placeholder="使用ツムで絞り込み..."
					onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
				/>
				<Button onClick={handleSearch} variant="outline" size="icon">
					<Search className="w-4 h-4" />
				</Button>
			</div>

			{/* フィルター表示 */}
			{tsumFilter && (
				<div className="flex items-center gap-2 text-sm">
					<span className="bg-sky-100 text-sky-700 px-2 py-1 rounded">
						{tsumFilter}
					</span>
					<button
						onClick={handleClearFilter}
						className="text-muted-foreground hover:text-red-600 text-xs"
					>
						クリア
					</button>
				</div>
			)}

			{/* エラー表示 */}
			{error && <p className="text-sm text-red-600 text-center">{error}</p>}

			{/* ランキング一覧 */}
			{filteredRankings.length === 0 && !isLoading ? (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						<Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
						{tsumFilter ? (
							<>
								<p>「{tsumFilter}」に一致するデータがありません</p>
								<p className="text-sm mt-1">別のツム名で検索してみてください</p>
							</>
						) : (
							<>
								<p>まだランキングデータがありません</p>
								<p className="text-sm mt-1">最初の投稿者になりましょう！</p>
							</>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="space-y-2">
					{filteredRankings.map((entry, index) => {
						const date = new Date(entry.created_at);
						const dateStr = date.toLocaleDateString('ja-JP');
						const isExpanded = expandedId === entry.id;

						return (
							<Card
								key={entry.id}
								className="cursor-pointer"
								onClick={() => toggleExpand(entry.id)}
							>
								<CardContent className="py-3 px-4">
									<div className="flex items-center gap-3">
										{/* 順位 */}
										<div className="w-10 text-center flex-shrink-0">
											{getRankDisplay(index)}
										</div>

										{/* メイン情報 */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<span className="font-bold truncate">
													{entry.nickname}
												</span>
												{entry.used_tsum && (
													<span className="text-xs bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded truncate">
														{entry.used_tsum}
													</span>
												)}
											</div>
											<div className="text-xs text-muted-foreground mt-0.5">
												{getItemCostLabel(entry.item_cost)} / {entry.play_count}
												回 / {dateStr}
											</div>
										</div>

										{/* 効率 */}
										<div className="text-right flex-shrink-0">
											<p className="text-lg font-bold text-sky-700">
												{formatNumber(entry.efficiency_30min)}
											</p>
											<p className="text-xs text-muted-foreground">
												コイン/30分
											</p>
											<p className="text-xs text-muted-foreground">
												({formatNumber(entry.efficiency_1min)}/分)
											</p>
										</div>

										<div className="flex-shrink-0">
											{isExpanded ? (
												<ChevronUp className="w-4 h-4 text-muted-foreground" />
											) : (
												<ChevronDown className="w-4 h-4 text-muted-foreground" />
											)}
										</div>
									</div>

									{/* プレイ詳細（展開時） */}
									{isExpanded && (
										<div className="mt-3 pt-3 border-t space-y-2">
											<div className="grid grid-cols-2 gap-2 text-sm">
												<div className="bg-gray-50 rounded p-2">
													<p className="text-xs text-muted-foreground">総素コイン</p>
													<p className="font-bold">{formatNumber(entry.total_raw_coins)}</p>
												</div>
												<div className="bg-gray-50 rounded p-2">
													<p className="text-xs text-muted-foreground">実質獲得</p>
													<p className="font-bold">{formatNumber(entry.net_coins)}</p>
												</div>
												<div className="bg-gray-50 rounded p-2">
													<p className="text-xs text-muted-foreground">経過時間</p>
													<p className="font-bold">{formatTime(entry.elapsed_seconds)}</p>
												</div>
												<div className="bg-gray-50 rounded p-2">
													<p className="text-xs text-muted-foreground">倍率</p>
													<p className="font-bold">×{entry.coin_multiplier}</p>
												</div>
											</div>

											{/* 各プレイの詳細 */}
											{entry.plays && entry.plays.length > 0 && (
												<div>
													<p className="text-xs font-medium text-muted-foreground mb-1">
														プレイ詳細
													</p>
													<div className="bg-gray-50 rounded p-2 space-y-1">
														{entry.plays.map((play, i) => {
															const earned = Math.round(play.rawCoins * entry.coin_multiplier);
															return (
																<div key={i} className="flex justify-between text-sm">
																	<span className="text-muted-foreground">{i + 1}回目</span>
																	<span>
																		<span className="font-mono">{formatNumber(play.rawCoins)}</span>
																		<span className="text-muted-foreground mx-1">→</span>
																		<span className="font-mono text-green-600">{formatNumber(earned)}</span>
																	</span>
																</div>
															);
														})}
													</div>
												</div>
											)}
										</div>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* ローディング */}
			{isLoading && (
				<div className="text-center py-4">
					<Loader2 className="w-6 h-6 mx-auto animate-spin text-sky-600" />
				</div>
			)}

			{/* もっと見る */}
			{hasMore && filteredRankings.length > 0 && !isLoading && (
				<Button onClick={handleLoadMore} variant="outline" className="w-full">
					<ChevronDown className="w-4 h-4 mr-2" />
					もっと見る
				</Button>
			)}
		</div>
	);
}
