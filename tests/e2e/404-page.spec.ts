import { expect, test } from '@playwright/test';

test.describe.skip('404 Error Page', () => {
	test('should display custom 404 page for non-existent routes', async ({ page }) => {
		// 存在しないページにアクセス
		const response = await page.goto('/blog/non-existent-page');

		// 404ステータスコード
		expect(response?.status()).toBe(404);

		// カスタム404ページが表示される
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();

		// エラーメッセージが表示される
		const message = page.locator('text=ページが見つかりませんでした');
		await expect(message).toBeVisible();

		// ホームに戻るリンクが存在する
		const homeLink = page.locator('a:has-text("ホームに戻る")');
		await expect(homeLink).toBeVisible();
	});

	test('should have animated bracket design', async ({ page }) => {
		await page.goto('/blog/non-existent-page');

		// SVGアニメーション要素が存在する
		const svgElements = page.locator('svg');
		const svgCount = await svgElements.count();
		expect(svgCount).toBeGreaterThan(0);

		// アニメーションが適用されている
		const animatedElement = page.locator('.animate-float-slow').first();
		await expect(animatedElement).toBeVisible();
	});

	test('should navigate back to home from 404 page', async ({ page }) => {
		await page.goto('/blog/non-existent-page');

		// ホームに戻るリンクをクリック
		const homeLink = page.locator('a:has-text("ホームに戻る")');
		await homeLink.click();

		// 記事一覧ページにリダイレクトされる
		await page.waitForURL('**/blog/articles/');

		// 正常にページが表示される
		const heading = page.locator('h1');
		await expect(heading).toContainText('Articles');
	});

	test('should not have scrollbar on 404 page', async ({ page }) => {
		await page.goto('/blog/non-existent-page');

		// スクロールバーが表示されていないことを確認
		const hasVerticalScrollbar = await page.evaluate(() => {
			return document.documentElement.scrollHeight > document.documentElement.clientHeight;
		});

		expect(hasVerticalScrollbar).toBe(false);
	});

	test('should maintain theme on 404 page', async ({ page }) => {
		// ダークモードを設定
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');
		await page.evaluate(() => localStorage.setItem('theme', 'dark'));

		// 404ページにアクセス
		await page.goto('/blog/non-existent-page');

		// ダークモードが維持されている
		const html = page.locator('html');
		await expect(html).toHaveClass(/dark/);
	});
});
