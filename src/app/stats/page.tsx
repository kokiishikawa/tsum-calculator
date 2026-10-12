import { StatsDashboard } from '@/components/StatsDashboard';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
	title: 'マイ統計',
	description:
		'保存したツムツムのコイン稼ぎ記録から、30分効率の推移とツム別の成績をグラフで確認できます。',
	path: '/stats',
});

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
