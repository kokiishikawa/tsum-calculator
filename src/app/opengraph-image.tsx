import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

export const alt = `${SITE_NAME} - コイン稼ぎの効率を自動計算`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const HEADING = 'ツムツム 30分効率計算機';
const SUBHEADING = 'コイン稼ぎの効率を自動計算';
const FEATURES = ['タイマー', '+Coin倍率', 'アイテム代', 'グラフ', 'ランキング'];

/**
 * 画像内の文字だけを含む日本語フォントを取得（ImageResponse は標準で日本語を描画できないため）
 * 取得できない場合は null を返し、フォント指定なしで描画する
 */
async function loadJapaneseFont(text: string): Promise<ArrayBuffer | null> {
	try {
		const css = await fetch(
			`https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`
		).then((res) => res.text());
		const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
		if (!url) return null;
		return await fetch(url).then((res) => res.arrayBuffer());
	} catch {
		return null;
	}
}

export default async function OpengraphImage() {
	const font = await loadJapaneseFont(HEADING + SUBHEADING + FEATURES.join('') + '30');

	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'linear-gradient(135deg, #e0f2fe 0%, #7dd3fc 100%)',
					fontFamily: font ? 'Noto Sans JP' : undefined,
				}}
			>
				<div
					style={{
						width: 180,
						height: 180,
						borderRadius: '50%',
						background: '#facc15',
						border: '8px solid #ca8a04',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: '#a16207',
						fontSize: 84,
						fontWeight: 700,
					}}
				>
					30
				</div>
				<div style={{ marginTop: 40, fontSize: 76, fontWeight: 700, color: '#0c4a6e' }}>
					{HEADING}
				</div>
				<div style={{ marginTop: 12, fontSize: 40, fontWeight: 700, color: '#0369a1' }}>
					{SUBHEADING}
				</div>
				<div style={{ marginTop: 36, display: 'flex', gap: 16 }}>
					{FEATURES.map((feature) => (
						<div
							key={feature}
							style={{
								padding: '8px 22px',
								borderRadius: 999,
								background: 'rgba(255,255,255,0.75)',
								color: '#0c4a6e',
								fontSize: 28,
								fontWeight: 700,
							}}
						>
							{feature}
						</div>
					))}
				</div>
			</div>
		),
		{
			...size,
			fonts: font ? [{ name: 'Noto Sans JP', data: font, weight: 700, style: 'normal' }] : undefined,
		}
	);
}
