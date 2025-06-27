import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
	test('should load the homepage', async ({ page }) => {
		await page.goto('/');

		// Check title
		await expect(page).toHaveTitle(/Code & Living/);

		// Check main heading exists
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();

		// Check navigation
		const nav = page.locator('nav');
		await expect(nav).toBeVisible();

		// Check footer
		const footer = page.locator('footer');
		await expect(footer).toBeVisible();

		// Check CSS is loaded
		const main = page.locator('main');
		const mainBg = await main.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		expect(mainBg).not.toBe('rgba(0, 0, 0, 0)');
	});

	test('should navigate to blog page', async ({ page }) => {
		await page.goto('/');

		// Click blog link
		await page.click('a[href="/articles/"]');

		// Wait for navigation
		await page.waitForURL('**/articles/');

		// Check we're on blog page
		await expect(page.locator('h1')).toContainText('Articles');
	});

	test('should have responsive design', async ({ page }) => {
		// Desktop view
		await page.setViewportSize({ width: 1200, height: 800 });
		await page.goto('/');

		// Check desktop layout
		const main = page.locator('main');
		await expect(main).toBeVisible();

		// Mobile view
		await page.setViewportSize({ width: 375, height: 667 });

		// Navigation should still be accessible
		const nav = page.locator('nav');
		await expect(nav).toBeVisible();
	});
});
