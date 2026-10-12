import { Calculator } from '@/components/Calculator';
import { AboutGuide, FAQ_ITEMS } from '@/components/AboutGuide';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

/**
 * 構造化データ（Googleにアプリの種類やFAQを伝える）
 */
const JSON_LD = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'WebApplication',
			name: SITE_NAME,
			url: `${SITE_URL}/`,
			description: SITE_DESCRIPTION,
			applicationCategory: 'UtilitiesApplication',
			operatingSystem: 'Web',
			inLanguage: 'ja',
			offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
		},
		{
			'@type': 'FAQPage',
			mainEntity: FAQ_ITEMS.map((item) => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: { '@type': 'Answer', text: item.answer },
			})),
		},
	],
};

export default function Home() {
	return (
		<>
			<script
				type="application/ld+json"
				// 固定データのみ。"<" をエスケープしてscriptタグを閉じられないようにする
				dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, '\\u003c') }}
			/>
			<Calculator>
				<AboutGuide />
			</Calculator>
		</>
	);
}
