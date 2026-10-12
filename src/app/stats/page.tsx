import { StatsDashboard } from '@/components/StatsDashboard';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';

export const metadata = {
	title: 'マイ統計 | ツムツム 30分効率計算機',
	description: '保存したセッションの効率推移とツム別成績',
};

export default function StatsPage() {
	return (
		<main className="min-h-screen bg-sky-50 dark:bg-background px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
			<div className="max-w-4xl mx-auto space-y-6">
				<AppHeader title="マイ統計" showBack />
				<StatsDashboard />
				<AppFooter />
			</div>
		</main>
	);
}
