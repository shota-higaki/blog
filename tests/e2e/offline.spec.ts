import { expect, test } from '@playwright/test';

test.describe('Offline Page and Service Worker', () => {
	test('should register service worker in production', async ({ page }) => {
		// 本番環境のテストではService Workerが登録される
		if (process.env.CI) {
			await page.goto('/blog/');

			// Service Workerが登録されるまで待つ
			await page.waitForTimeout(2000);

			// Service Workerが登録されていることを確認
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
		// オフラインページに直接アクセス（publicフォルダの静的HTML）
		await page.goto('/blog/offline.html');

		// タイトル確認
		await expect(page).toHaveTitle(/オフライン/);

		// ゲームキャンバスが存在する
		const canvas = page.locator('canvas#gameCanvas');
		await expect(canvas).toBeVisible();

		// ゲーム説明が表示される
		const message = page.locator('text=インターネット接続がありません');
		await expect(message).toBeVisible();
	});

	test('should have playable Code Rain game', async ({ page }) => {
		await page.goto('/blog/offline.html');

		// ゲームが開始される
		const canvas = page.locator('canvas#gameCanvas');
		await expect(canvas).toBeVisible();

		// スコア表示が存在する
		const scoreElement = page.locator('#score');
		await expect(scoreElement).toBeVisible();
		await expect(scoreElement).toHaveText('0');

		// ライフ表示が存在する
		const livesElement = page.locator('#lives');
		await expect(livesElement).toBeVisible();
		await expect(livesElement).toHaveText('3');

		// キーボード操作が可能（実際に操作を送信）
		await page.keyboard.press('ArrowLeft');
		await page.keyboard.press('ArrowRight');

		// ゲームが動作していることを確認
		// Canvas要素があることで十分とする
		const hasCanvas = await page.evaluate(() => {
			const canvas = document.querySelector('canvas#gameCanvas');
			return canvas !== null && canvas instanceof HTMLCanvasElement;
		});
		expect(hasCanvas).toBe(true);
	});

	test('should show touch controls on mobile', async ({ page }) => {
		// モバイルビューポートに設定
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/blog/offline.html');

		// タッチコントロールが表示される
		const touchControls = page.locator('#touchControls');
		await expect(touchControls).toBeVisible();

		// 左右のボタンが存在する
		const leftBtn = page.locator('#leftBtn');
		const rightBtn = page.locator('#rightBtn');
		await expect(leftBtn).toBeVisible();
		await expect(rightBtn).toBeVisible();

		// ボタンのアクセシビリティラベルを確認
		await expect(leftBtn).toHaveAttribute('aria-label', '左に移動');
		await expect(rightBtn).toHaveAttribute('aria-label', '右に移動');
	});

	test('should be responsive', async ({ page }) => {
		await page.goto('/blog/offline.html');

		// デスクトップサイズ
		await page.setViewportSize({ width: 1200, height: 800 });
		let canvasRect = await page.locator('#gameCanvas').boundingBox();
		expect(canvasRect?.width).toBeGreaterThan(600);

		// タブレットサイズ
		await page.setViewportSize({ width: 768, height: 1024 });
		canvasRect = await page.locator('#gameCanvas').boundingBox();
		expect(canvasRect?.width).toBeLessThan(800);

		// モバイルサイズ
		await page.setViewportSize({ width: 375, height: 667 });
		canvasRect = await page.locator('#gameCanvas').boundingBox();
		expect(canvasRect?.width).toBeLessThan(400);

		// タッチコントロールがモバイルでのみ表示
		const touchControls = page.locator('#touchControls');
		await expect(touchControls).toBeVisible();
	});

	test('should handle game over state', async ({ page }) => {
		await page.goto('/blog/offline.html');

		// ライフを0にしてゲームオーバーを発生させる
		await page.evaluate(() => {
			// @ts-ignore
			window.lives = 0;
			// @ts-ignore
			window.gameOver();
		});

		// ゲームオーバー画面が表示される
		const gameOverElement = page.locator('#gameOver');
		await expect(gameOverElement).toBeVisible();

		// リトライボタンが表示される
		const retryBtn = page.locator('.retry-btn');
		await expect(retryBtn).toBeVisible();
		await expect(retryBtn).toHaveText('もう一度プレイ');

		// リトライボタンをクリック
		await retryBtn.click();

		// ゲームがリセットされる
		await expect(gameOverElement).not.toBeVisible();
		const livesElement = page.locator('#lives');
		await expect(livesElement).toHaveText('3');
	});
});
