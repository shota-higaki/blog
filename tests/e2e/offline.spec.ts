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
		await page.goto('/blog/offline.html');

		// タイトル確認
		await expect(page).toHaveTitle(/オフライン/);

		// ゲームキャンバスが存在する
		const canvas = page.locator('canvas#gameCanvas');
		await expect(canvas).toBeVisible();

		// ゲーム説明が表示される
		const instructions = page.locator('text=文字をキャッチしてスコアを稼ごう');
		await expect(instructions).toBeVisible();
	});

	test('should have playable Code Rain game', async ({ page }) => {
		await page.goto('/blog/offline.html');

		// ゲームが開始される
		const canvas = page.locator('canvas#gameCanvas');
		await expect(canvas).toBeVisible();

		// スコア表示が存在する
		const scoreElement = await page.evaluate(() => {
			const canvas = document.querySelector('canvas#gameCanvas');
			return canvas !== null;
		});
		expect(scoreElement).toBe(true);

		// キーボード操作が可能
		await page.keyboard.press('ArrowLeft');
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('Space');

		// ゲームが動作していることを確認（canvasが更新される）
		const canvasData1 = await canvas.screenshot();
		await page.waitForTimeout(100);
		const canvasData2 = await canvas.screenshot();

		// キャンバスの内容が変化している（アニメーションが動いている）
		expect(Buffer.compare(canvasData1, canvasData2)).not.toBe(0);
	});

	test('should show game controls', async ({ page }) => {
		await page.goto('/blog/offline.html');

		// コントロール説明が表示される
		const controls = ['← → : 移動', 'スペース : ダッシュ'];

		for (const control of controls) {
			const element = page.locator(`text=${control}`);
			await expect(element).toBeVisible();
		}
	});

	test('should have proper styling for offline page', async ({ page }) => {
		await page.goto('/blog/offline.html');

		// 背景色が設定されている
		const body = page.locator('body');
		const bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		expect(bgColor).toBe('rgb(10, 10, 10)');

		// テキストが見やすい色になっている
		const text = page.locator('h1').first();
		const textColor = await text.evaluate((el) => window.getComputedStyle(el).color);
		expect(textColor).toBe('rgb(167, 205, 87)');
	});
});
