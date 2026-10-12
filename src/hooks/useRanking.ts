'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RankingEntry, RankingSubmission } from '@/types';
import { useLocalStorage } from './useLocalStorage';

const PAGE_SIZE = 50;

/**
 * 投稿用にサインイン済みのユーザーIDを返す
 * 未サインインなら匿名ユーザーを作成する（登録・ログイン操作は不要）
 * セッションはブラウザに保存されるため、同じブラウザなら自分の投稿を削除できる
 */
async function ensureSignedIn(): Promise<string> {
	const { data } = await supabase.auth.getSession();
	if (data.session) return data.session.user.id;

	const { data: signInData, error } = await supabase.auth.signInAnonymously();
	if (error || !signInData.user) {
		throw new Error('投稿の準備に失敗しました。時間をおいて再度お試しください。');
	}
	return signInData.user.id;
}

export function useRanking() {
	const [rankings, setRankings] = useState<RankingEntry[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [nickname, setNickname] = useLocalStorage<string>(
		'tsum-calculator-nickname',
		'',
	);

	// 自分の投稿を判定するため、現在のユーザーを追跡（閲覧だけならサインインしない）
	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			setCurrentUserId(data.session?.user.id ?? null);
		});
		const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
			setCurrentUserId(session?.user.id ?? null);
		});
		return () => listener.subscription.unsubscribe();
	}, []);

	// ランキング取得
	const fetchRankings = useCallback(
		async (options?: {
			limit?: number;
			offset?: number;
			reset?: boolean;
			onlyUserId?: string; // 指定したユーザーの投稿のみ取得
		}) => {
			const limit = options?.limit ?? PAGE_SIZE;
			const offset = options?.offset ?? 0;
			const reset = options?.reset ?? true;

			setIsLoading(true);
			setError(null);

			try {
				let query = supabase
					.from('rankings')
					.select('*')
					.order('efficiency_30min', { ascending: false })
					.order('created_at', { ascending: false })
					.range(offset, offset + limit - 1);
				if (options?.onlyUserId) {
					query = query.eq('user_id', options.onlyUserId);
				}

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

	// ランキング投稿（投稿者IDはDB側で auth.uid() が自動設定される）
	const submitRanking = useCallback(
		async (submission: RankingSubmission): Promise<boolean> => {
			setIsLoading(true);
			setError(null);

			try {
				await ensureSignedIn();
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

	// 自分の投稿を削除
	const deleteRanking = useCallback(async (id: string): Promise<boolean> => {
		setError(null);
		try {
			// RLSで他人の投稿は削除対象から外れるため、削除できた行数で成否を判定する
			const { data, error: deleteError } = await supabase
				.from('rankings')
				.delete()
				.eq('id', id)
				.select('id');
			if (deleteError) throw deleteError;
			if (!data || data.length === 0) {
				throw new Error('この投稿を削除する権限がありません。');
			}
			setRankings((prev) => prev.filter((entry) => entry.id !== id));
			return true;
		} catch (err) {
			setError(err instanceof Error ? err.message : '削除に失敗しました');
			return false;
		}
	}, []);

	return {
		rankings,
		isLoading,
		error,
		hasMore,
		nickname,
		setNickname,
		currentUserId,
		fetchRankings,
		submitRanking,
		deleteRanking,
	};
}
