#!/usr/bin/env bun

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const _gitHooksPath = join(process.cwd(), '.githooks');
const _localHookPath = join(process.cwd(), '.git', 'hooks', 'pre-commit');

console.log('🔧 Git フックのセットアップ中...\n');

// Check if .git directory exists
if (!existsSync('.git')) {
	console.error('❌ .git ディレクトリが見つかりません。Gitリポジトリで実行してください。');
	process.exit(1);
}

try {
	// Set git hooks path
	execSync('git config core.hooksPath .githooks', { stdio: 'inherit' });
	console.log('✅ Git フックパスを .githooks に設定しました');

	// Make hooks executable
	execSync('chmod +x .githooks/*', { stdio: 'inherit' });
	console.log('✅ フックスクリプトに実行権限を付与しました');

	console.log('\n🎉 セットアップ完了！');
	console.log('pre-commitフックが有効になりました。');
	console.log('コミット時に自動的にセキュリティチェックが実行されます。\n');

	// Test security check with staged files only
	console.log('📋 セキュリティチェックのテスト実行（ステージングされたファイルのみ）...');
	try {
		execSync('bun run scripts/security-check.ts --staged', { stdio: 'inherit' });
	} catch (_e) {
		// It's OK if no staged files or if check finds issues in staged files
		console.log(
			'\n💡 ヒント: .env.local ファイルは gitignore されているため、コミットされません。',
		);
	}
} catch (error) {
	console.error('❌ セットアップ中にエラーが発生しました:', error);
	process.exit(1);
}
