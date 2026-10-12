// lib/site.ts - サイト情報（SEO・OGP用）

import type { Metadata } from 'next';

/**
 * サイトの絶対URL
 * Vercel ではビルド時に本番ドメインが自動設定される（独自ドメイン追加時も追従）
 * 別のURLを使う場合は NEXT_PUBLIC_SITE_URL で上書きする
 */
export const SITE_URL = (
	process.env.NEXT_PUBLIC_SITE_URL ??
	(process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: 'http://localhost:3000')
).replace(/\/$/, '');

export const SITE_NAME = 'ツムツム 30分効率計算機';

export const SITE_TITLE = 'ツムツム 30分効率計算機｜コイン稼ぎの効率を自動計算';

export const SITE_DESCRIPTION =
	'ツムツムのコイン稼ぎ効率（30分効率）を自動計算する無料ツール。タイマーを動かして素コインを入力するだけで、+Coin倍率とアイテム代を差し引いた30分効率・1分効率をリアルタイムに表示。ツム別の成績グラフやランキングにも対応。';

export const SITE_KEYWORDS = [
	'ツムツム',
	'30分効率',
	'ツムツム 30分効率',
	'ツムツム コイン効率',
	'ツムツム コイン稼ぎ',
	'コイン稼ぎ',
	'効率 計算',
	'計算ツール',
];

const OG_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: SITE_NAME };

/**
 * 下層ページのメタデータ
 * 子ページで openGraph / twitter を指定すると親の設定が丸ごと置き換わるため、画像も含めて組み立てる
 */
export function pageMetadata({
	title,
	description,
	path,
}: {
	title: string;
	description: string;
	path: string;
}): Metadata {
	const fullTitle = `${title} | ${SITE_NAME}`;
	return {
		title,
		description,
		alternates: { canonical: path },
		openGraph: {
			type: 'website',
			locale: 'ja_JP',
			siteName: SITE_NAME,
			title: fullTitle,
			description,
			url: path,
			images: [OG_IMAGE],
		},
		twitter: {
			card: 'summary_large_image',
			title: fullTitle,
			description,
			images: [OG_IMAGE],
		},
	};
}
