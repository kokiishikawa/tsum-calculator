import Link from 'next/link';
import { ArrowLeft, BarChart3, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AppHeaderProps {
	title: string;
	showBack?: boolean;
}

export function AppHeader({ title, showBack = false }: AppHeaderProps) {
	return (
		<header className="flex items-center gap-1 pt-2">
			{showBack && (
				<Button asChild variant="ghost" size="icon" aria-label="戻る">
					<Link href="/">
						<ArrowLeft className="w-5 h-5" />
					</Link>
				</Button>
			)}
			<h1 className="flex-1 text-xl md:text-3xl font-bold text-sky-700 dark:text-sky-300 truncate">
				{title}
			</h1>
			<nav className="flex items-center">
				<Button asChild variant="ghost" size="icon" aria-label="統計">
					<Link href="/stats">
						<BarChart3 className="w-5 h-5" />
					</Link>
				</Button>
				<Button asChild variant="ghost" size="icon" aria-label="ランキング">
					<Link href="/ranking">
						<Trophy className="w-5 h-5" />
					</Link>
				</Button>
				<ThemeToggle />
			</nav>
		</header>
	);
}
