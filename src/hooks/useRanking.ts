'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RankingEntry, RankingSubmission } from '@/types';
import { useLocalStorage } from './useLocalStorage';

const PAGE_SIZE = 50;

export function useRanking() {
	const [rankings, setRankings] = useState<RankingEntry[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [nickname, setNickname] = useLocalStorage<string>(
		'tsum-calculator-nickname',
		'',
	);

	// ランキング取得
	const fetchRankings = useCallback(
		async (options?: {
			limit?: number;
			offset?: number;
			reset?: boolean;
		}) => {
			const limit = options?.limit ?? PAGE_SIZE;
			const offset = options?.offset ?? 0;
			const reset = options?.reset ?? true;

			setIsLoading(true);
			setError(null);

			try {
				const query = supabase
					.from('rankings')
					.select('*')
					.order('efficiency_30min', { ascending: false })
					.order('created_at', { ascending: false })
					.range(offset, offset + limit - 1);

				const { data, error: queryError } = await query;
				if (queryError) throw queryError;

				if (reset) {
					setRankings(data ?? []);
				} else {
					setRankings((prev) => [...prev, ...(data ?? [])]);
				}
				setHasMore((data?.length ?? 0) >= limit);
			} catch (err) {
				setError(err instanceof Error ? err.message : '取得に失敗しました。');
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	// ランキング投稿
	const submitRanking = useCallback(
		async (submission: RankingSubmission): Promise<boolean> => {
			setIsLoading(true);
			setError(null);

			try {
				const { error: insertError } = await supabase
					.from('rankings')
					.insert(submission);

				if (insertError) throw insertError;
				return true;
			} catch (err) {
				setError(err instanceof Error ? err.message : '投稿に失敗しました');
				return false;
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	return {
		rankings,
		isLoading,
		error,
		hasMore,
		nickname,
		setNickname,
		fetchRankings,
		submitRanking,
	};
}
