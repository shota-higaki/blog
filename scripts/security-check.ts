#!/usr/bin/env bun

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const SENSITIVE_PATTERNS = [
	// Google Analytics IDs
	/G-[A-Z0-9]{10}/g,
	// API Keys (generic patterns)
	/(?:api[_-]?key|apikey)\s*[:=]\s*['"]?[a-zA-Z0-9\-_]{20,}['"]?/gi,
	// AWS Access Keys
	/AKIA[0-9A-Z]{16}/g,
	// Private keys
	/-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH)\s+PRIVATE\s+KEY-----/gi,
];

const EXCLUDED_DIRS = [
	'.git',
	'node_modules',
	'dist',
	'.astro',
	'test-results',
	'playwright-report',
];

const ALLOWED_FILES = [
	'.env.local',
	'.env.local.example',
	'.env.example',
	'README.md',
	'CLAUDE.md',
	'docs/',
];

async function* walkFiles(dir: string): AsyncGenerator<string> {
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		const _relativePath = relative(process.cwd(), fullPath);

		if (entry.isDirectory()) {
			if (!EXCLUDED_DIRS.includes(entry.name)) {
				yield* walkFiles(fullPath);
			}
		} else if (entry.isFile()) {
			// Skip binary files
			if (!/\.(jpg|jpeg|png|gif|ico|pdf|zip|tar|gz|exe|dll|so|dylib)$/i.test(entry.name)) {
				yield fullPath;
			}
		}
	}
}

async function checkFile(filePath: string): Promise<{ file: string; matches: string[] }> {
	const content = await readFile(filePath, 'utf-8');
	const relativePath = relative(process.cwd(), filePath);
	const matches: string[] = [];

	// Check if file is in allowed list
	const isAllowed = ALLOWED_FILES.some(
		(allowed) => relativePath.startsWith(allowed) || relativePath === allowed,
	);

	if (isAllowed) {
		return { file: relativePath, matches: [] };
	}

	for (const pattern of SENSITIVE_PATTERNS) {
		const found = content.match(pattern);
		if (found) {
			matches.push(...found);
		}
	}

	return { file: relativePath, matches };
}

async function main() {
	console.log('🔍 セキュリティチェックを実行中...\n');

	let hasIssues = false;
	const staged = process.argv.includes('--staged');

	if (staged) {
		// Check only staged files
		const { execSync } = await import('node:child_process');
		const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
			.split('\n')
			.filter(Boolean)
			.filter((file) => !file.match(/\.(jpg|jpeg|png|gif|ico|pdf|zip|tar|gz|exe|dll|so|dylib)$/i));

		for (const file of stagedFiles) {
			try {
				const result = await checkFile(file);
				if (result.matches.length > 0) {
					console.log(`❌ ${result.file}`);
					console.log(`   発見された機密情報: ${result.matches.join(', ')}`);
					hasIssues = true;
				}
			} catch (_err) {
				// File might be deleted
			}
		}
	} else {
		// Check all files
		for await (const file of walkFiles(process.cwd())) {
			const result = await checkFile(file);
			if (result.matches.length > 0) {
				console.log(`❌ ${result.file}`);
				console.log(`   発見された機密情報: ${result.matches.join(', ')}`);
				hasIssues = true;
			}
		}
	}

	if (hasIssues) {
		console.log('\n⚠️  機密情報が検出されました！');
		console.log('以下の対処を行ってください:');
		console.log('1. 機密情報を環境変数に移動');
		console.log('2. .env.local に設定を追加');
		console.log('3. コード内では import.meta.env.PUBLIC_* を使用\n');
		process.exit(1);
	} else {
		console.log('✅ セキュリティチェック完了: 問題ありません\n');
	}
}

main().catch(console.error);
