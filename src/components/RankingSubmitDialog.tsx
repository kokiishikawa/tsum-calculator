'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Statistics, Settings, Play, RankingSubmission } from '@/types';
import { formatNumber } from '@/lib/calculator';
import { useRanking } from '@/hooks';
import { Trophy, Loader2 } from 'lucide-react';

interface RankingSubmitDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	statistics: Statistics;
	settings: Settings;
	plays: Play[];
	elapsedSeconds: number;
}

export function RankingSubmitDialog({
	open,
	onOpenChange,
	statistics,
	settings,
	plays,
	elapsedSeconds,
}: RankingSubmitDialogProps) {
	const { nickname, setNickname, submitRanking, isLoading, error } =
		useRanking();
	const [submitStatus, setSubmitStatus] = useState<
		'idle' | 'success' | 'error'
	>('idle');

	const handleSubmit = async () => {
		if (!nickname.trim()) return;

		const submission: RankingSubmission = {
			nickname: nickname.trim(),
			efficiency_30min: statistics.efficiency30min,
			efficiency_1min: statistics.efficiency1min,
			used_tsum: settings.usedTsum,
			play_count: statistics.playCount,
			coin_multiplier: settings.coinMultiplier,
			item_cost: settings.itemCost,
			total_raw_coins: statistics.totalRawCoins,
			net_coins: statistics.netCoins,
			elapsed_seconds: elapsedSeconds,
			plays: plays.map((p) => ({
				rawCoins: p.rawCoins,
				elapsedTime: p.elapsedTime,
			})),
		};

		const success = await submitRanking(submission);
		setSubmitStatus(success ? 'success' : 'error');
	};

	const handleClose = () => {
		setSubmitStatus('idle');
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Trophy className="w-5 h-5 text-yellow-500" />
						ランキングに投稿
					</DialogTitle>
				</DialogHeader>

				{submitStatus === 'success' ? (
					<div className="text-center space-y-4 py-4">
						<p className="text-2xl">🎉</p>
						<p className="font-bold text-green-600">投稿しました！</p>
						<Button onClick={handleClose} className="w-full">
							閉じる
						</Button>
					</div>
				) : (
					<div className="space-y-4">
						{/* プレビュー */}
						<div className="bg-sky-50 rounded-lg p-3 space-y-1 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">30分効率</span>
								<span className="font-bold text-sky-700">
									{formatNumber(statistics.efficiency30min)}
								</span>
							</div>
							{settings.usedTsum && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">使用ツム</span>
									<span>{settings.usedTsum}</span>
								</div>
							)}
							<div className="flex justify-between">
								<span className="text-muted-foreground">プレイ回数</span>
								<span>{statistics.playCount} 回</span>
							</div>
						</div>

						{/* ニックネーム入力 */}
						<div>
							<label className="text-sm font-medium mb-1 block">
								ニックネーム
							</label>
							<Input
								value={nickname}
								onChange={(e) => setNickname(e.target.value)}
								placeholder="ニックネームを入力（20文字以内）"
								maxLength={20}
							/>
						</div>

						{/* エラー表示 */}
						{(error || submitStatus === 'error') && (
							<p className="text-sm text-red-600">
								{error || '投稿に失敗しました。もう一度お試しください。'}
							</p>
						)}

						{/* 投稿ボタン */}
						<Button
							onClick={handleSubmit}
							disabled={!nickname.trim() || isLoading}
							className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
						>
							{isLoading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									投稿中...
								</>
							) : (
								<>
									<Trophy className="w-4 h-4 mr-2" />
									投稿する
								</>
							)}
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
