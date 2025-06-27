// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://shota-higaki.github.io',
	integrations: [mdx(), sitemap()],

	// Markdown設定
	markdown: {
		// シンタックスハイライトの設定
		shikiConfig: {
			theme: 'github-dark',
			wrap: true,
		},
		// 見出しに自動的にアンカーリンクを追加
		remarkPlugins: [],
		rehypePlugins: [],
	},

	vite: {
		plugins: [tailwindcss()],
		build: {
			// CSSコード分割を無効化して1つのファイルに
			cssCodeSplit: false,
		},
	},

	// 画像最適化設定
	image: {
		// AVIF形式を追加
		formats: ['avif', 'webp'],
		// 画像品質を調整（70%でも十分な品質）
		quality: 70,
	},

	// ビルド最適化
	build: {
		// HTML圧縮を有効化
		inlineStylesheets: 'auto',
		// アセットのインライン化閾値を調整（2KB以下はインライン化）
		assetsInlineLimit: 2048,
	},

	// 圧縮設定
	compressHTML: true,

	// プリフェッチ設定（ユーザーがリンクにホバーした時に先読み）
	prefetch: {
		prefetchAll: false,
		defaultStrategy: 'hover',
	},
});
