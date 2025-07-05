import { expect, test } from '@playwright/test';

test.describe('SEO and Meta Tags', () => {
	test('should have proper meta tags on homepage', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		// 基本的なメタタグ
		const title = await page.title();
		expect(title).toContain('Code & Living');

		const description = await page.locator('meta[name="description"]').getAttribute('content');
		expect(description).toBeTruthy();

		// Open Graphタグ
		const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
		expect(ogTitle).toBeTruthy();

		const ogDescription = await page
			.locator('meta[property="og:description"]')
			.getAttribute('content');
		expect(ogDescription).toBeTruthy();

		const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
		expect(ogImage).toBeTruthy();
		expect(ogImage).toContain('/og-image.svg');

		// Twitter Cardタグ
		const twitterCard = await page.locator('meta[property="twitter:card"]').getAttribute('content');
		expect(twitterCard).toBe('summary_large_image');
	});

	test('should have canonical URL', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
		expect(canonical).toBeTruthy();
		expect(canonical).toContain('/blog/articles/');
	});

	test('should have RSS feed link', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		const rssLink = await page.locator('link[type="application/rss+xml"]').getAttribute('href');
		expect(rssLink).toBeTruthy();
		expect(rssLink).toContain('/rss.xml');
	});

	test('should have sitemap link', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		const sitemapLink = await page.locator('link[rel="sitemap"]').getAttribute('href');
		expect(sitemapLink).toBeTruthy();
		expect(sitemapLink).toContain('/sitemap-index.xml');
	});

	test('should have structured data on blog post', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		// 記事ページに移動
		const firstPostLink = page.locator('article a').first();
		await firstPostLink.click();
		await page.waitForURL('**/blog/articles/**/');

		// JSON-LD構造化データが存在する
		const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
		expect(jsonLdScripts.length).toBeGreaterThan(0);

		// BlogPostingスキーマが含まれているか確認
		let hasBlogPosting = false;
		for (const script of jsonLdScripts) {
			const content = await script.textContent();
			if (content && content.includes('"@type":"BlogPosting"')) {
				hasBlogPosting = true;
				break;
			}
		}
		expect(hasBlogPosting).toBe(true);
	});

	test('should have theme-color meta tag', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
		expect(themeColor).toBeTruthy();
	});

	test('should have proper viewport meta tag', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
		expect(viewport).toBe('width=device-width,initial-scale=1');
	});
});
