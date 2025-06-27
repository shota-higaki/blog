/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			typography: {
				DEFAULT: {
					css: {
						// H1の設定
						h1: {
							fontSize: '2.25em',
							marginTop: '0',
							marginBottom: '0.8888889em',
							lineHeight: '1.1111111',
							fontWeight: '800',
						},
						// H2の設定
						h2: {
							fontSize: '1.5em',
							marginTop: '2em',
							marginBottom: '1em',
							lineHeight: '1.3333333',
							fontWeight: '700',
						},
						// H3の設定
						h3: {
							fontSize: '1.25em',
							marginTop: '1.6em',
							marginBottom: '0.6em',
							lineHeight: '1.6',
							fontWeight: '600',
						},
						// H4の設定
						h4: {
							fontSize: '1.125em',
							marginTop: '1.5em',
							marginBottom: '0.5em',
							lineHeight: '1.5',
							fontWeight: '600',
						},
						// リンクの色
						a: {
							color: '#2563eb',
							textDecoration: 'underline',
							fontWeight: '500',
							'&:hover': {
								color: '#1e40af',
							},
						},
						// インラインコード
						code: {
							backgroundColor: '#f3f4f6',
							paddingLeft: '0.25rem',
							paddingRight: '0.25rem',
							paddingTop: '0.125rem',
							paddingBottom: '0.125rem',
							borderRadius: '0.25rem',
							fontWeight: '600',
							fontSize: '0.875em',
						},
						// コードブロック
						pre: {
							backgroundColor: '#1f2937',
							color: '#e5e7eb',
						},
						// 引用
						blockquote: {
							fontWeight: '500',
							fontStyle: 'italic',
							color: '#374151',
							borderLeftWidth: '0.25rem',
							borderLeftColor: '#e5e7eb',
							quotes: '"\\201C""\\201D""\\2018""\\2019"',
							marginTop: '1.6em',
							marginBottom: '1.6em',
							paddingLeft: '1em',
						},
						// 太字
						strong: {
							fontWeight: '700',
							color: '#111827',
						},
						// リスト
						'ul > li': {
							paddingLeft: '1.75em',
						},
						'ol > li': {
							paddingLeft: '1.75em',
						},
						// テーブル
						table: {
							width: '100%',
							tableLayout: 'auto',
							textAlign: 'left',
						},
						'thead th': {
							fontWeight: '600',
							borderBottomWidth: '2px',
							borderBottomColor: '#e5e7eb',
							paddingBottom: '0.5714286em',
						},
						'tbody tr': {
							borderBottomWidth: '1px',
							borderBottomColor: '#f3f4f6',
						},
						'tbody td': {
							paddingTop: '0.5714286em',
							paddingBottom: '0.5714286em',
						},
					},
				},
				lg: {
					css: {
						fontSize: '1.125rem',
						h1: {
							fontSize: '2.5em',
						},
						h2: {
							fontSize: '1.75em',
						},
						h3: {
							fontSize: '1.375em',
						},
						h4: {
							fontSize: '1.125em',
						},
					},
				},
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
	// パフォーマンス最適化
	corePlugins: {
		// 使用していないユーティリティを無効化
		preflight: true,
		container: false,
		float: false,
		clear: false,
		skew: false,
		scale: false,
		rotate: false,
		translate: false,
		resize: false,
		scrollSnapType: false,
		touchAction: false,
		scrollBehavior: false,
		textOverflow: false,
		whitespace: false,
		wordBreak: false,
		overscrollBehavior: false,
	},
};
