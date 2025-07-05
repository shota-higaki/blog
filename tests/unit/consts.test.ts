import { describe, expect, it } from 'vitest';
import { SITE_DESCRIPTION, SITE_TITLE } from '../../src/consts';

describe('Constants', () => {
	it('should have correct site title', () => {
		expect(SITE_TITLE).toBe('Code & Living');
	});

	it('should have correct site description', () => {
		expect(SITE_DESCRIPTION).toBe('技術と生活を繋ぐブログ');
	});

	it('should not be empty strings', () => {
		expect(SITE_TITLE).not.toBe('');
		expect(SITE_DESCRIPTION).not.toBe('');
	});
});
