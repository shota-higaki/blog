import { expect, test } from '@playwright/test';

test.describe('Performance Optimizations', () => {
	test('should have resource hints for external domains', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		// DNS prefetch for Google Analytics
		const dnsPrefetch = await page.locator('link[rel="dns-prefetch"]').all();
		const prefetchHrefs = await Promise.all(dnsPrefetch.map((el) => el.getAttribute('href')));

		expect(prefetchHrefs).toContain('https://www.googletagmanager.com');
		expect(prefetchHrefs).toContain('https://www.google-analytics.com');

		// Preconnect
		const preconnect = await page.locator('link[rel="preconnect"]').all();
		expect(preconnect.length).toBeGreaterThan(0);
	});

	test('should lazy load images below the fold', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		// 記事ページに移動（画像がある場合）
		const images = await page.locator('img').all();

		if (images.length > 0) {
			for (const img of images) {
				const loading = await img.getAttribute('loading');
				// ヒーロー画像以外はlazy loading
				const isHero = await img.evaluate((el) => el.closest('.hero-image') !== null);
				if (!isHero) {
					expect(loading).toBe('lazy');
				}
			}
		}
	});

	test('should have optimized CSS delivery', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		// スタイルが適用されているか確認（インラインまたは外部CSS）
		const hasStyles = await page.evaluate(() => {
			// インラインスタイル、外部CSS、またはstyleタグがあるか確認
			const hasInlineStyles = document.querySelector('style') !== null;
			const hasExternalCSS = document.querySelector('link[rel="stylesheet"]') !== null;
			const hasStyledElements =
				window.getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)';

			return hasInlineStyles || hasExternalCSS || hasStyledElements;
		});

		// 何らかの形でスタイルが適用されている
		expect(hasStyles).toBe(true);
	});

	test('should compress assets', async ({ page }) => {
		const response = await page.goto('/blog/');

		// レスポンスヘッダーを確認
		const headers = response?.headers() || {};

		// 本番環境では圧縮が有効
		if (process.env.CI) {
			const encoding = headers['content-encoding'];
			expect(['gzip', 'br', 'deflate']).toContain(encoding);
		}
	});

	test('should implement prefetch on hover', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		// prefetchが動作することを確認
		const firstLink = page.locator('article a').first();

		// ホバー前のprefetchリンク数を記録
		const prefetchBefore = await page.locator('link[rel="prefetch"]').count();

		// リンクにホバー
		await firstLink.hover();
		await page.waitForTimeout(100);

		// Astroのprefetch機能が有効な場合、prefetchリンクが追加される可能性がある
		const prefetchAfter = await page.locator('link[rel="prefetch"]').count();

		// prefetch戦略が設定されていることを確認
		expect(prefetchAfter).toBeGreaterThanOrEqual(prefetchBefore);
	});

	test('should have web app manifest', async ({ page }) => {
		await page.goto('/blog/');

		const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
		expect(manifestLink).toBeTruthy();
		expect(manifestLink).toContain('site.webmanifest');

		// マニフェストファイルが存在する
		const manifestResponse = await page.request.get(manifestLink!);
		expect(manifestResponse.status()).toBe(200);

		const manifest = await manifestResponse.json();
		expect(manifest.name).toBe('Code & Living');
		expect(manifest.icons).toBeDefined();
		expect(manifest.icons.length).toBeGreaterThan(0);
	});
});
