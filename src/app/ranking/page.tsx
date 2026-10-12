import { RankingBoard } from '@/components/RankingBoard';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
	title: '30分効率ランキング',
	description:
		'ツムツムのコイン稼ぎ30分効率をみんなで競うランキング。使用ツム・アイテム構成ごとの効率をチェックして、コイン稼ぎに強いツムを見つけよう。',
	path: '/ranking',
});

export default function RankingPage() {
	return (
		<main className="min-h-screen bg-sky-50 dark:bg-background px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
			<div className="max-w-4xl mx-auto space-y-6">
				<AppHeader title="コミュニティランキング" showBack />
				<RankingBoard />
				<AppFooter />
			</div>
		</main>
	);
}
