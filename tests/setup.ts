// Vitest setup file
import { vi } from 'vitest';

// Mock import.meta.env
vi.stubGlobal('import.meta.env', {
	BASE_URL: '/blog',
	MODE: 'test',
	PROD: false,
	DEV: true,
	SSR: true,
});
