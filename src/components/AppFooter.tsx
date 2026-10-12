import { APP_VERSION } from '@/types';

export function AppFooter() {
	return (
		<footer className="text-center text-sm text-muted-foreground py-4">
			<p>ツムツム 30分効率計算機 v{APP_VERSION}</p>
		</footer>
	);
}
