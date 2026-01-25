import { vi } from 'vitest';

// Astro.propsをモックする関数
// biome-ignore lint/suspicious/noExplicitAny: Mocking generic props
export function mockAstroProps(props: Record<string, any>) {
	return {
		props,
		url: new URL('https://example.com/blog'),
		site: new URL('https://example.com'),
		// 他のAstroグローバルプロパティ
	};
}

// 日付のフォーマットテスト用ヘルパー
export function formatDateForTest(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}年${month}月${day}日`;
}

// LocalStorageのモック
export function mockLocalStorage() {
	const storage: Record<string, string> = {};

	const localStorageMock = {
		getItem: vi.fn((key: string) => storage[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			storage[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete storage[key];
		}),
		clear: vi.fn(() => {
			Object.keys(storage).forEach((key) => {
				delete storage[key];
			});
		}),
		length: 0,
		key: vi.fn((index: number) => Object.keys(storage)[index] || null),
	};

	Object.defineProperty(window, 'localStorage', {
		value: localStorageMock,
		writable: true,
	});

	return { storage, mock: localStorageMock };
}

// メディアクエリのモック
export function mockMatchMedia(matches: boolean = false) {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: vi.fn().mockImplementation((query) => ({
			matches,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});
}
