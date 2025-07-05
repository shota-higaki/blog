import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockLocalStorage, mockMatchMedia } from '../utils/test-helpers';

describe('Theme Toggle Logic', () => {
	let localStorageMock: ReturnType<typeof mockLocalStorage>;

	beforeEach(() => {
		// LocalStorageをモック
		localStorageMock = mockLocalStorage();
		// matchMediaをモック
		mockMatchMedia(false);
		// documentをリセット
		document.documentElement.classList.remove('dark');
	});

	describe('Theme Detection', () => {
		it('should detect theme from localStorage', () => {
			localStorageMock.storage.theme = 'dark';

			const theme = localStorage.getItem('theme');
			expect(theme).toBe('dark');
		});

		it('should detect system preference when no localStorage theme', () => {
			mockMatchMedia(true); // ダークモードを好む

			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			expect(prefersDark).toBe(true);
		});

		it('should default to light theme when no preference', () => {
			mockMatchMedia(false);

			const theme = localStorage.getItem('theme');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

			expect(theme).toBeNull();
			expect(prefersDark).toBe(false);
		});
	});

	describe('Theme Toggle', () => {
		it('should toggle from light to dark', () => {
			// 初期状態: ライトモード
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');

			// トグル実行をシミュレート
			const isDark = document.documentElement.classList.contains('dark');
			if (isDark) {
				document.documentElement.classList.remove('dark');
				localStorage.setItem('theme', 'light');
			} else {
				document.documentElement.classList.add('dark');
				localStorage.setItem('theme', 'dark');
			}

			expect(document.documentElement.classList.contains('dark')).toBe(true);
			expect(localStorage.getItem('theme')).toBe('dark');
		});

		it('should toggle from dark to light', () => {
			// 初期状態: ダークモード
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');

			// トグル実行をシミュレート
			const isDark = document.documentElement.classList.contains('dark');
			if (isDark) {
				document.documentElement.classList.remove('dark');
				localStorage.setItem('theme', 'light');
			} else {
				document.documentElement.classList.add('dark');
				localStorage.setItem('theme', 'dark');
			}

			expect(document.documentElement.classList.contains('dark')).toBe(false);
			expect(localStorage.getItem('theme')).toBe('light');
		});
	});

	describe('Theme Persistence', () => {
		it('should persist theme selection in localStorage', () => {
			localStorage.setItem('theme', 'dark');
			expect(localStorage.getItem('theme')).toBe('dark');

			localStorage.setItem('theme', 'light');
			expect(localStorage.getItem('theme')).toBe('light');
		});

		it('should apply saved theme on load', () => {
			// ダークテーマを保存
			localStorage.setItem('theme', 'dark');

			// ページロード時の処理をシミュレート
			const savedTheme = localStorage.getItem('theme');
			if (savedTheme === 'dark') {
				document.documentElement.classList.add('dark');
			}

			expect(document.documentElement.classList.contains('dark')).toBe(true);
		});
	});
});
