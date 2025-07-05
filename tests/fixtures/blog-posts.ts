// テスト用のブログ投稿データ
export const mockBlogPosts = [
	{
		id: 'test-post-1',
		slug: 'test-post-1',
		body: 'Test post content 1',
		collection: 'blog',
		data: {
			title: 'テスト投稿1',
			description: 'これはテスト投稿1です',
			publishDate: new Date('2024-01-01'),
			updatedDate: undefined,
			heroImage: undefined,
			heroImageAlt: undefined,
		},
	},
	{
		id: 'test-post-2',
		slug: 'test-post-2',
		body: 'Test post content 2',
		collection: 'blog',
		data: {
			title: 'テスト投稿2',
			description: 'これはテスト投稿2です',
			publishDate: new Date('2024-01-15'),
			updatedDate: new Date('2024-01-20'),
			heroImage: undefined,
			heroImageAlt: undefined,
		},
	},
	{
		id: 'future-post',
		slug: 'future-post',
		body: 'Future post content',
		collection: 'blog',
		data: {
			title: '未来の投稿',
			description: 'これは未来の日付の投稿です',
			publishDate: new Date('2099-12-31'),
			updatedDate: undefined,
			heroImage: undefined,
			heroImageAlt: undefined,
		},
	},
];
