import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'ツムツム 30分効率計算機',
		short_name: 'ツム効率',
		description: 'LINE:ディズニー ツムツムのコイン稼ぎ効率を計算',
		start_url: '/',
		display: 'standalone',
		orientation: 'portrait',
		background_color: '#f0f9ff',
		theme_color: '#0ea5e9',
		lang: 'ja',
		icons: [
			{ src: '/icons/192', sizes: '192x192', type: 'image/png' },
			{ src: '/icons/512', sizes: '512x512', type: 'image/png' },
			{ src: '/icons/512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
		],
	};
}
