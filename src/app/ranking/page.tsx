import { RankingBoard } from '@/components/RankingBoard';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';

export const metadata = {
	title: 'ランキング | ツムツム 30分効率計算機',
	description: 'コミュニティの30分効率ランキング',
};

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
