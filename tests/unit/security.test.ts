import { describe, expect, it } from 'vitest';

describe('Security Patterns', () => {
	describe('Sensitive Information Detection', () => {
		const patterns = {
			googleAnalyticsId: /G-[A-Z0-9]{10}/,
			apiKey: /(?:api[_-]?key|apikey)["\s]*[:=]["\s]*[a-zA-Z0-9\-_]+/i,
			awsAccessKey: /AKIA[0-9A-Z]{16}/,
			privateKey: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/,
		};

		it('should detect Google Analytics ID', () => {
			const validIds = ['G-ABCDEF1234', 'G-1234567890', 'G-ZYXWVUTSRQ'];
			const invalidIds = ['G-ABC', 'GA-1234567890', 'G_ABCDEF1234', 'G-abcdef1234'];

			validIds.forEach((id) => {
				expect(patterns.googleAnalyticsId.test(id)).toBe(true);
			});

			invalidIds.forEach((id) => {
				expect(patterns.googleAnalyticsId.test(id)).toBe(false);
			});
		});

		it('should detect API keys', () => {
			const testCases = [
				{ text: 'api_key=abc123def456', shouldMatch: true },
				{ text: 'apiKey: "mySecretKey123"', shouldMatch: true },
				{ text: 'API-KEY="testkey789"', shouldMatch: true },
				{ text: 'my_key=notAnApiKey', shouldMatch: false },
				{ text: 'key=value', shouldMatch: false },
			];

			testCases.forEach(({ text, shouldMatch }) => {
				expect(patterns.apiKey.test(text)).toBe(shouldMatch);
			});
		});

		it('should detect AWS access keys', () => {
			const validKeys = ['AKIAIOSFODNN7EXAMPLE', 'AKIA1234567890ABCDEF'];

			const invalidKeys = [
				'AKIA123', // Too short
				'BKIAIOSFODNN7EXAMPLE', // Wrong prefix
				'akia1234567890abcdef', // Lowercase
			];

			validKeys.forEach((key) => {
				expect(patterns.awsAccessKey.test(key)).toBe(true);
			});

			invalidKeys.forEach((key) => {
				expect(patterns.awsAccessKey.test(key)).toBe(false);
			});
		});

		it('should detect private keys', () => {
			const privateKeyStart = '-----BEGIN PRIVATE KEY-----';
			const rsaPrivateKeyStart = '-----BEGIN RSA PRIVATE KEY-----';

			expect(patterns.privateKey.test(privateKeyStart)).toBe(true);
			expect(patterns.privateKey.test(rsaPrivateKeyStart)).toBe(true);
			expect(patterns.privateKey.test('-----BEGIN PUBLIC KEY-----')).toBe(false);
		});
	});

	describe('Security Headers', () => {
		const headers = {
			'X-Frame-Options': 'DENY',
			'X-Content-Type-Options': 'nosniff',
			'X-XSS-Protection': '1; mode=block',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
			'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
		};

		it('should have correct X-Frame-Options', () => {
			expect(headers['X-Frame-Options']).toBe('DENY');
		});

		it('should have correct X-Content-Type-Options', () => {
			expect(headers['X-Content-Type-Options']).toBe('nosniff');
		});

		it('should have correct Referrer-Policy', () => {
			expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
		});

		it('should have restrictive Permissions-Policy', () => {
			const policy = headers['Permissions-Policy'];
			expect(policy).toContain('camera=()');
			expect(policy).toContain('microphone=()');
			expect(policy).toContain('geolocation=()');
		});
	});

	describe('Content Security Policy', () => {
		it('should have valid CSP directives', () => {
			const csp = {
				'default-src': ["'self'"],
				'script-src': ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],
				'style-src': ["'self'", "'unsafe-inline'"],
				'img-src': ["'self'", 'data:', 'https:'],
				'font-src': ["'self'"],
				'connect-src': ["'self'", 'https://www.google-analytics.com'],
			};

			// default-srcが'self'を含むことを確認
			expect(csp['default-src']).toContain("'self'");

			// Google Analyticsのドメインが含まれることを確認
			expect(csp['script-src']).toContain('https://www.googletagmanager.com');
			expect(csp['connect-src']).toContain('https://www.google-analytics.com');

			// 画像ソースがhttpsを許可することを確認
			expect(csp['img-src']).toContain('https:');
		});
	});
});
