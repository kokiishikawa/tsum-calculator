import type { Metadata } from 'next';

// 開発用の接続確認ページなので検索結果に出さない
export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default function TestSupabaseLayout({ children }: { children: React.ReactNode }) {
	return children;
}
