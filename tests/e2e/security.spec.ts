import { expect, test } from '@playwright/test';

test.describe('Security Features', () => {
	test('should have security headers in production', async ({ page }) => {
		// 本番環境でのみセキュリティヘッダーをチェック
		if (process.env.CI) {
			const response = await page.goto('/blog/');
			const headers = response?.headers() || {};

			// X-Frame-Options
			expect(headers['x-frame-options']).toBe('DENY');

			// X-Content-Type-Options
			expect(headers['x-content-type-options']).toBe('nosniff');

			// X-XSS-Protection
			expect(headers['x-xss-protection']).toBe('1; mode=block');

			// Referrer-Policy
			expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');

			// Permissions-Policy
			const permissionsPolicy = headers['permissions-policy'];
			expect(permissionsPolicy).toContain('camera=()');
			expect(permissionsPolicy).toContain('microphone=()');
			expect(permissionsPolicy).toContain('geolocation=()');

			// Content-Security-Policy
			const csp = headers['content-security-policy'];
			expect(csp).toBeTruthy();
			expect(csp).toContain("default-src 'self'");
		}
	});

	test('should not expose sensitive information in HTML', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		const htmlContent = await page.content();

		// Google Analytics IDが直接露出していないことを確認
		// (環境変数として処理されているはず)
		const gaIdPattern = /G-[A-Z0-9]{10}/;
		const exposedGaId = htmlContent.match(gaIdPattern);

		// GAタグ内では許可されるが、それ以外の場所では露出してはいけない
		if (exposedGaId) {
			const isInGoogleTagScript = htmlContent.includes(
				`googletagmanager.com/gtag/js?id=${exposedGaId[0]}`,
			);
			expect(isInGoogleTagScript).toBe(true);
		}

		// APIキーやシークレットが露出していないことを確認
		expect(htmlContent).not.toMatch(/api[_-]?key["\s]*[:=]["\s]*[a-zA-Z0-9\-_]+/i);
		expect(htmlContent).not.toMatch(/AKIA[0-9A-Z]{16}/); // AWS Access Key
		expect(htmlContent).not.toMatch(/-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/);
	});

	test('should have console warning script', async ({ page }) => {
		// コンソールメッセージを監視
		const consoleMessages: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'log' || msg.type() === 'warning') {
				consoleMessages.push(msg.text());
			}
		});

		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		// console-warning.jsが読み込まれている
		const consoleWarningScript = await page.locator('script[src*="console-warning.js"]').count();
		expect(consoleWarningScript).toBe(1);

		// 警告メッセージが含まれているか確認
		const hasWarningMessage = consoleMessages.some(
			(msg) => msg.includes('STOP') || msg.includes('警告') || msg.includes('注意'),
		);
		expect(hasWarningMessage).toBe(true);
	});

	test('should not have inline event handlers', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		// インラインイベントハンドラーがないことを確認
		const htmlContent = await page.content();

		const inlineHandlers = ['onclick=', 'onmouseover=', 'onerror=', 'onload=', 'onsubmit='];

		for (const handler of inlineHandlers) {
			expect(htmlContent).not.toContain(handler);
		}
	});

	test('should have secure external links', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForURL('**/blog/articles/');

		// 外部リンクを取得
		const externalLinks = await page
			.locator('a[href^="http"]:not([href*="shota-higaki.github.io"])')
			.all();

		for (const link of externalLinks) {
			const href = await link.getAttribute('href');

			// HTTPSを使用している
			expect(href).toMatch(/^https:/);

			// rel属性が適切に設定されている
			const rel = await link.getAttribute('rel');
			if (rel) {
				expect(rel).toContain('noopener');
			}
		}
	});
});
