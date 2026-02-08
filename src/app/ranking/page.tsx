import { RankingBoard } from '@/components/RankingBoard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
	title: 'ランキング | ツムツム 30分効率計算機',
	description: 'コミュニティの30分効率ランキング',
};

export default function RankingPage() {
	return (
		<main className="min-h-screen bg-sky-50 p-4">
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="flex items-center gap-4 pt-4">
					<Link href="/">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="w-5 h-5" />
						</Button>
					</Link>
					<h1 className="text-3xl md:text-4xl font-bold text-sky-700">
						コミュニティランキング
					</h1>
				</div>

				<RankingBoard />

				<footer className="text-center text-sm text-muted-foreground py-4">
					<p>ツムツム 30分効率計算機 v1.3</p>
				</footer>
			</div>
		</main>
	);
}
