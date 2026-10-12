'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label="ダークモード切り替え"
			onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
		>
			{/* ハイドレーション前でもちらつかないようCSSで出し分ける */}
			<Sun className="w-5 h-5 hidden dark:block" />
			<Moon className="w-5 h-5 dark:hidden" />
		</Button>
	);
}
