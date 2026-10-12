'use client';

import { useEffect } from 'react';

/**
 * PWA用のService Workerを登録（本番のみ）
 */
export function ServiceWorkerRegister() {
	useEffect(() => {
		if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
		navigator.serviceWorker.register('/sw.js').catch((error) => {
			console.warn('Service Worker registration failed:', error);
		});
	}, []);

	return null;
}
