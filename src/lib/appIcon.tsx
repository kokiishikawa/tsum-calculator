import { ImageResponse } from 'next/og';

/**
 * アプリアイコン（コイン）を指定サイズのPNGで生成
 */
export function renderAppIcon(size: number) {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: '#0ea5e9',
				}}
			>
				<div
					style={{
						width: size * 0.62,
						height: size * 0.62,
						borderRadius: '50%',
						background: '#facc15',
						border: `${size * 0.04}px solid #ca8a04`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: '#a16207',
						fontSize: size * 0.3,
						fontWeight: 700,
					}}
				>
					30
				</div>
			</div>
		),
		{ width: size, height: size }
	);
}
