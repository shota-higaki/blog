import { describe, expect, it } from 'vitest';
import { formatDateForTest } from '../utils/test-helpers';

describe('Date Formatting', () => {
	it('should format date correctly in Japanese', () => {
		const date = new Date('2024-01-15');
		expect(formatDateForTest(date)).toBe('2024年01月15日');
	});

	it('should handle single digit month and day', () => {
		const date = new Date('2024-03-05');
		expect(formatDateForTest(date)).toBe('2024年03月05日');
	});

	it('should handle December correctly', () => {
		const date = new Date('2024-12-31');
		expect(formatDateForTest(date)).toBe('2024年12月31日');
	});
});

describe('Collection Utilities', () => {
	it('should filter posts by publish date', () => {
		const posts = [
			{ data: { publishDate: new Date('2024-01-01') } },
			{ data: { publishDate: new Date('2099-12-31') } },
			{ data: { publishDate: new Date('2023-12-01') } },
		];

		const now = new Date('2024-06-01');
		const filtered = posts.filter((post) => post.data.publishDate <= now);

		expect(filtered).toHaveLength(2);
		expect(filtered.every((post) => post.data.publishDate <= now)).toBe(true);
	});

	it('should sort posts by date descending', () => {
		const posts = [
			{ data: { publishDate: new Date('2024-01-15') } },
			{ data: { publishDate: new Date('2024-03-01') } },
			{ data: { publishDate: new Date('2024-02-01') } },
		];

		const sorted = [...posts].sort(
			(a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
		);

		expect(sorted[0].data.publishDate).toEqual(new Date('2024-03-01'));
		expect(sorted[1].data.publishDate).toEqual(new Date('2024-02-01'));
		expect(sorted[2].data.publishDate).toEqual(new Date('2024-01-15'));
	});
});
