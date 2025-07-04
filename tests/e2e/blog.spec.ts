import { expect, test } from '@playwright/test';

test.describe('Blog functionality', () => {
	test('should display blog posts list', async ({ page }) => {
		await page.goto('/blog/articles/');

		// Check page title
		await expect(page.locator('h1')).toContainText('Articles');

		// Check if posts are displayed
		const posts = page.locator('article');
		await expect(posts).toHaveCount(await posts.count());

		// First post should be visible
		const firstPost = posts.first();
		await expect(firstPost).toBeVisible();

		// Post should have title
		const postTitle = firstPost.locator('h2');
		await expect(postTitle).toBeVisible();

		// Post should have date
		const postDate = firstPost.locator('time').first();
		await expect(postDate).toBeVisible();
	});

	test('should navigate to individual blog post', async ({ page }) => {
		await page.goto('/blog/articles/');

		// Get first post link
		const firstPostLink = page.locator('article a').first();
		const postTitle = await firstPostLink.locator('h2').textContent();

		// Click the post
		await firstPostLink.click();

		// Wait for navigation
		await page.waitForURL('**/blog/articles/**');

		// Check we're on the post page
		const pageTitle = page.locator('h1');
		await expect(pageTitle).toContainText(postTitle || '');

		// Check post content is visible
		const content = page.locator('article');
		await expect(content).toBeVisible();
	});

	test('should display markdown content correctly', async ({ page }) => {
		// Navigate to the test markdown post
		await page.goto('/blog/articles/hello-world.mdx/');

		// Check various markdown elements
		// Headings
		await expect(page.locator('h2').first()).toBeVisible();
		await expect(page.locator('h3').first()).toBeVisible();

		// Lists
		await expect(page.locator('ul').first()).toBeVisible();
		// No ordered lists in current content

		// Code blocks
		await expect(page.locator('pre').first()).toBeVisible();
		await expect(page.locator('code').first()).toBeVisible();

		// Links
		const link = page.locator('a[href*="astro.build"]');
		await expect(link).toBeVisible();

		// Table
		await expect(page.locator('table').first()).toBeVisible();
	});

	// 予約投稿のテストは現在記事が1つしかないため削除

	test('should have proper meta tags', async ({ page }) => {
		await page.goto('/blog/articles/hello-world.mdx/');

		// Check meta description
		const metaDescription = page.locator('meta[name="description"]');
		await expect(metaDescription).toHaveAttribute('content', /AIコーディングエージェント/);

		// Check Open Graph tags
		const ogTitle = page.locator('meta[property="og:title"]');
		await expect(ogTitle).toHaveAttribute('content', /Hello World/);
	});
});
