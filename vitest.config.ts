import { getViteConfig } from 'astro/config';
import { defineConfig } from 'vitest/config';

export default defineConfig(
	getViteConfig(
		defineConfig({
			test: {
				globals: true,
				environment: 'happy-dom',
				setupFiles: ['./tests/setup.ts'],
				include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
				exclude: ['tests/e2e/**/*', 'node_modules/**/*'],
				coverage: {
					provider: 'v8',
					reporter: ['text', 'json', 'html'],
					exclude: [
						'node_modules/**',
						'tests/**',
						'**/*.d.ts',
						'**/*.config.*',
						'**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
						'scripts/**',
						'.astro/**',
					],
				},
				reporters: ['default'],
				watchExclude: ['**/node_modules/**', '**/dist/**', '**/.astro/**'],
			},
		}),
	),
);
