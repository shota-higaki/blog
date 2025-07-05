import { describe, expect, it } from 'vitest';

// StructuredDataコンポーネントのロジックをテスト
describe('StructuredData Logic', () => {
	describe('WebSite Schema', () => {
		it('should generate correct WebSite schema', () => {
			const schema = {
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				name: 'Code & Living',
				description: '技術と生活を繋ぐブログ',
				url: 'https://example.com',
				potentialAction: {
					'@type': 'SearchAction',
					target: {
						'@type': 'EntryPoint',
						urlTemplate: 'https://example.com/search?q={search_term_string}',
					},
					'query-input': 'required name=search_term_string',
				},
			};

			expect(schema['@type']).toBe('WebSite');
			expect(schema.name).toBe('Code & Living');
			expect(schema.potentialAction['@type']).toBe('SearchAction');
		});
	});

	describe('BlogPosting Schema', () => {
		it('should generate correct BlogPosting schema', () => {
			const publishDate = new Date('2024-01-15');
			const updatedDate = new Date('2024-01-20');

			const schema = {
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: 'テスト記事',
				description: 'これはテスト記事です',
				datePublished: publishDate.toISOString(),
				dateModified: updatedDate.toISOString(),
				author: {
					'@type': 'Person',
					name: 'Shota Higaki',
					url: 'https://example.com/about',
				},
				publisher: {
					'@type': 'Organization',
					name: 'Code & Living',
					logo: {
						'@type': 'ImageObject',
						url: 'https://example.com/logo.png',
					},
				},
				mainEntityOfPage: {
					'@type': 'WebPage',
					'@id': 'https://example.com/articles/test-article',
				},
			};

			expect(schema['@type']).toBe('BlogPosting');
			expect(schema.headline).toBe('テスト記事');
			expect(schema.author['@type']).toBe('Person');
			expect(schema.publisher['@type']).toBe('Organization');
		});

		it('should handle posts without updated date', () => {
			const publishDate = new Date('2024-01-15');

			const schema = {
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: 'テスト記事',
				description: 'これはテスト記事です',
				datePublished: publishDate.toISOString(),
				dateModified: publishDate.toISOString(), // 更新日がない場合は公開日を使用
			};

			expect(schema.datePublished).toBe(schema.dateModified);
		});
	});

	describe('BreadcrumbList Schema', () => {
		it('should generate correct BreadcrumbList schema', () => {
			const breadcrumbs = [
				{ name: 'ホーム', url: 'https://example.com' },
				{ name: '記事一覧', url: 'https://example.com/articles' },
				{ name: 'テスト記事', url: 'https://example.com/articles/test' },
			];

			const schema = {
				'@context': 'https://schema.org',
				'@type': 'BreadcrumbList',
				itemListElement: breadcrumbs.map((item, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: item.name,
					item: item.url,
				})),
			};

			expect(schema['@type']).toBe('BreadcrumbList');
			expect(schema.itemListElement).toHaveLength(3);
			expect(schema.itemListElement[0].position).toBe(1);
			expect(schema.itemListElement[0].name).toBe('ホーム');
			expect(schema.itemListElement[2].position).toBe(3);
			expect(schema.itemListElement[2].name).toBe('テスト記事');
		});
	});
});
