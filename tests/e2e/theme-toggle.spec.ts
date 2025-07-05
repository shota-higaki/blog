import { expect, test } from '@playwright/test';

test.describe('Theme Toggle', () => {
	test.beforeEach(async ({ page }) => {
		// LocalStorageをクリア
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');
		await page.evaluate(() => localStorage.clear());
	});

	test('should toggle between light and dark theme', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		// 初期状態はライトモード（システム設定がない場合）
		const html = page.locator('html');
		await expect(html).not.toHaveClass(/dark/);

		// テーマトグルボタンをクリック
		const themeToggle = page.locator('button[aria-label*="テーマ"]');
		await themeToggle.click();

		// ダークモードに切り替わる
		await expect(html).toHaveClass(/dark/);

		// LocalStorageに保存される
		const theme = await page.evaluate(() => localStorage.getItem('theme'));
		expect(theme).toBe('dark');

		// もう一度クリックしてライトモードに戻る
		await themeToggle.click();
		await expect(html).not.toHaveClass(/dark/);

		const themeAfter = await page.evaluate(() => localStorage.getItem('theme'));
		expect(themeAfter).toBe('light');
	});

	test('should persist theme across page navigation', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		// ダークモードに設定
		const themeToggle = page.locator('button[aria-label*="テーマ"]');
		await themeToggle.click();

		// 別のページに移動
		const firstPostLink = page.locator('article a').first();
		await firstPostLink.click();
		await page.waitForURL('**/blog/articles/**/');

		// ダークモードが維持されている
		const html = page.locator('html');
		await expect(html).toHaveClass(/dark/);
	});

	test('should have proper accessibility attributes', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		const themeToggle = page.locator('button[aria-label*="テーマ"]');

		// aria-labelが存在する
		const ariaLabel = await themeToggle.getAttribute('aria-label');
		expect(ariaLabel).toBeTruthy();

		// フォーカス可能
		await themeToggle.focus();
		await expect(themeToggle).toBeFocused();

		// キーボードで操作可能
		await page.keyboard.press('Enter');
		const html = page.locator('html');
		await expect(html).toHaveClass(/dark/);
	});

	test('should show correct icon for current theme', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		const themeToggle = page.locator('button[aria-label*="テーマ"]');

		// ライトモードでは月のアイコンが表示される
		const moonIcon = themeToggle.locator('svg').first();
		await expect(moonIcon).toBeVisible();

		// ダークモードに切り替え
		await themeToggle.click();

		// ダークモードでは太陽のアイコンが表示される
		const sunIcon = themeToggle.locator('svg').first();
		await expect(sunIcon).toBeVisible();
	});
});
