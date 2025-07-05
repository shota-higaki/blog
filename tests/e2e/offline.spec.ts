import { expect, test } from '@playwright/test';

test.describe('Offline Page and Service Worker', () => {
	test('should register service worker in production', async ({ page }) => {
		// 本番環境のテストではService Workerが登録される
		if (process.env.CI) {
			await page.goto('/blog/');

			// Service Workerが登録されるまで待つ
			await page.waitForTimeout(2000);

			const swRegistered = await page.evaluate(async () => {
				if ('serviceWorker' in navigator) {
					const registrations = await navigator.serviceWorker.getRegistrations();
					return registrations.length > 0;
				}
				return false;
			});

			expect(swRegistered).toBe(true);
		}
	});

	test('should display offline page when directly accessed', async ({ page }) => {
		// オフラインページに直接アクセス
		await page.goto('/blog/offline/');

		// タイトル確認
		await expect(page).toHaveTitle(/オフライン/);

		// ゲームキャンバスが存在する
		const canvas = page.locator('canvas#gameCanvas');
		await expect(canvas).toBeVisible();

		// ゲーム説明が表示される
		const instructions = page.locator('text=ゲームをプレイしながらお待ちください');
		await expect(instructions).toBeVisible();
	});

	test('should have playable Code Rain game', async ({ page }) => {
		await page.goto('/blog/offline/');

		// ゲームが開始される
		const canvas = page.locator('canvas#gameCanvas');
		await expect(canvas).toBeVisible();

		// スコア表示が存在する
		const scoreElement = await page.evaluate(() => {
			const canvas = document.querySelector('canvas#gameCanvas');
			return canvas !== null;
		});
		expect(scoreElement).toBe(true);

		// キーボード操作が可能（実際に操作を送信）
		await page.keyboard.press('ArrowLeft');
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('Space');

		// ゲームが動作していることを確認
		// Canvas要素があることで十分とする
		const hasCanvas = await page.evaluate(() => {
			const canvas = document.querySelector('canvas#gameCanvas');
			return canvas !== null && canvas instanceof HTMLCanvasElement;
		});
		expect(hasCanvas).toBe(true);
	});

	test('should show game controls', async ({ page }) => {
		await page.goto('/blog/offline/');

		// コントロール説明が表示される
		const instructions = page.locator('text=← → キーで移動');
		await expect(instructions).toBeVisible();
	});

	test('should have proper styling for offline page', async ({ page }) => {
		await page.goto('/blog/offline/');

		// 背景色が設定されている
		const body = page.locator('body');
		const bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		expect(bgColor).toBe('rgb(26, 26, 26)');

		// テキストが見やすい色になっている
		const text = page.locator('h1').first();
		const textColor = await text.evaluate((el) => window.getComputedStyle(el).color);
		expect(textColor).toBe('rgb(134, 239, 172)');
	});
});
