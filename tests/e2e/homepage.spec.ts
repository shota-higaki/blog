import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
	test('should load the homepage and redirect to articles', async ({ page }) => {
		await page.goto('/blog/');

		// Wait for redirect to articles page
		await page.waitForURL('**/blog/articles/');

		// Check title
		await expect(page).toHaveTitle(/Code & Living/);

		// Check main heading exists
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
		await expect(heading).toContainText('Articles');

		// Check navigation
		const nav = page.locator('nav');
		await expect(nav).toBeVisible();

		// Check footer
		const footer = page.locator('footer');
		await expect(footer).toBeVisible();

		// Check CSS is loaded by verifying that body has a background color
		const body = page.locator('body');
		const bodyBg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		// Body should have a background color (not transparent)
		expect(bodyBg).not.toBe('rgba(0, 0, 0, 0)');
	});

	test('should navigate to a blog post', async ({ page }) => {
		await page.goto('/blog/');

		// Wait for redirect to articles page
		await page.waitForURL('**/blog/articles/');

		// Click first blog post link
		const firstPostLink = page.locator('article a').first();
		await firstPostLink.click();

		// Wait for navigation to a specific blog post
		await page.waitForURL('**/blog/articles/**/');

		// Check we're on a blog post page (should have article content)
		const article = page.locator('article');
		await expect(article).toBeVisible();
	});

	test('should have responsive design', async ({ page }) => {
		// Desktop view
		await page.setViewportSize({ width: 1200, height: 800 });
		await page.goto('/blog/');

		// Wait for redirect
		await page.waitForURL('**/blog/articles/');

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
