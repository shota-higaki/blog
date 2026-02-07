#!/usr/bin/env bun

/**
 * CI Runner - Bun's concurrency features for parallel CI execution
 */

import { cpus } from 'node:os';
import { parseArgs } from 'node:util';
import { $ } from 'bun';

// ANSI color codes
const colors = {
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	reset: '\x1b[0m',
	dim: '\x1b[2m',
};

// Task definition
interface Task {
	name: string;
	command: string;
	dependsOn?: string[];
	timeout?: number; // タイムアウト時間（ミリ秒）
}

const tasks: Task[] = [
	{ name: 'typecheck', command: 'bun run typecheck', timeout: 10000 }, // 10秒
	{ name: 'lint', command: 'bun run lint', timeout: 10000 }, // 10秒
	{ name: 'format', command: 'bun run format:check', timeout: 5000 }, // 5秒
	{ name: 'test:unit', command: 'bun run test:unit', timeout: 60000 }, // 60秒に延長
	{
		name: 'build',
		command: 'bun run build',
		dependsOn: ['lint', 'format', 'typecheck'],
		timeout: 30000, // 30秒
	},
	{
		name: 'test:e2e',
		command: 'bun run test:e2e',
		dependsOn: ['build'],
		timeout: 180000, // 180秒に延長
	},
];

// Task result
interface TaskResult {
	name: string;
	success: boolean;
	duration: number;
	output?: string;
	error?: string;
}

// Parse command line arguments
const { values } = parseArgs({
	args: Bun.argv.slice(2),
	options: {
		only: {
			type: 'string',
			short: 'o',
			description: 'Run only specific tasks (comma-separated)',
		},
		skip: {
			type: 'string',
			short: 's',
			description: 'Skip specific tasks (comma-separated)',
		},
		verbose: {
			type: 'boolean',
			short: 'v',
			description: 'Show detailed output',
		},
		help: {
			type: 'boolean',
			short: 'h',
			description: 'Show help',
		},
	},
	strict: false,
	allowPositionals: true,
});

// Show help if requested
if (values.help) {
	console.log(`
${colors.magenta}⚡ Bun CI Runner${colors.reset}

Usage: bun run ci [options]

Options:
  -o, --only <tasks>     Run only specific tasks (comma-separated)
  -s, --skip <tasks>     Skip specific tasks (comma-separated)
  -v, --verbose          Show detailed output
  -h, --help             Show this help message

Examples:
  bun run ci                       # Run all tasks
  bun run ci --only lint,test:unit # Run only lint and unit tests
  bun run ci --skip test:e2e       # Run all tasks except E2E tests
  bun run ci --verbose             # Show detailed output
`);
	process.exit(0);
}

// Filter tasks based on options
function filterTasks(): Task[] {
	let filteredTasks = [...tasks];

	if (values.only && typeof values.only === 'string') {
		const onlyTasks = values.only.split(',').map((t: string) => t.trim());
		filteredTasks = filteredTasks.filter((t) => onlyTasks.includes(t.name));
	}

	if (values.skip && typeof values.skip === 'string') {
		const skipTasks = values.skip.split(',').map((t: string) => t.trim());
		filteredTasks = filteredTasks.filter((t) => !skipTasks.includes(t.name));
	}

	return filteredTasks;
}

// Progress bar helper for test tasks
function showTestProgress(taskName: string, current: number, total: number) {
	const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
	const barLength = 30;
	const filledLength = Math.floor((percentage / 100) * barLength);
	const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

	// Move cursor to beginning of line and clear it
	process.stdout.write('\r\x1b[K');
	process.stdout.write(
		`${colors.yellow}▶ ${taskName}${colors.reset} ${colors.dim}[${bar}] ${current}/${total} tests${colors.reset}`,
	);
}

async function runTask(task: Task): Promise<TaskResult> {
	const startTime = performance.now();
	console.log(`${colors.yellow}▶ Starting: ${task.name}${colors.reset}`);

	try {
		// タイムアウト付きでコマンドを実行
		const proc = Bun.spawn(['sh', '-c', task.command], {
			stdout: 'pipe',
			stderr: 'pipe',
		});

		// タイムアウトを設定
		const timeout = task.timeout || 20000; // デフォルト20秒

		// テストタスクの場合、出力をストリーミングして進捗を表示
		const isTestTask = task.name.includes('test');
		const testProgress = { current: 0, total: 0 };
		let output = '';
		let errorOutput = '';

		if (isTestTask) {
			// 出力を非同期で読み取る
			const decoder = new TextDecoder();
			let buffer = '';

			// stdout ストリームを読み取る
			const readStream = async (stream: ReadableStream) => {
				const reader = stream.getReader();
				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;

						const chunk = decoder.decode(value, { stream: true });
						buffer += chunk;
						output += chunk;

						// 行ごとに処理
						const lines = buffer.split('\n');
						buffer = lines.pop() || '';

						for (const line of lines) {
							// Vitestの出力パターン
							if (task.name === 'test:unit') {
								// テストファイル実行中
								const fileMatch = line.match(/✓\s+tests\/unit\/.*\.test\.ts\s+\((\d+)\s+tests?\)/);
								if (fileMatch) {
									testProgress.current += parseInt(fileMatch[1], 10);
								}
								// 合計テスト数
								const totalMatch = line.match(/Test Files.*\((\d+)\)/);
								if (totalMatch) {
									testProgress.total = 35; // 既知の合計テスト数
								}
								// 最終結果
								const finalMatch = line.match(/Tests\s+(\d+)\s+passed/);
								if (finalMatch) {
									testProgress.current = parseInt(finalMatch[1], 10);
									testProgress.total = parseInt(finalMatch[1], 10);
								}
							}

							// Playwrightの出力パターン
							if (task.name === 'test:e2e') {
								const totalMatch = line.match(/Running (\d+) tests? using/);
								if (totalMatch) {
									testProgress.total = parseInt(totalMatch[1], 10);
								}
								const progressMatch = line.match(/\[(\d+)\/(\d+)\]/);
								if (progressMatch) {
									testProgress.current = parseInt(progressMatch[1], 10);
								}
							}

							// プログレスバーを更新
							if (testProgress.total > 0) {
								showTestProgress(task.name, testProgress.current, testProgress.total);
							}
						}
					}
				} finally {
					reader.releaseLock();
				}
			};

			// stderr ストリームを読み取る
			const readError = async (stream: ReadableStream) => {
				const reader = stream.getReader();
				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						errorOutput += decoder.decode(value, { stream: true });
					}
				} finally {
					reader.releaseLock();
				}
			};

			// タイムアウトプロミス
			const timeoutPromise = new Promise<never>((_, reject) => {
				setTimeout(() => {
					proc.kill();
					reject(new Error(`Task ${task.name} timed out after ${timeout / 1000}s`));
				}, timeout);
			});

			// 並行して実行
			const [exitCode] = await Promise.all([
				Promise.race([proc.exited, timeoutPromise]),
				readStream(proc.stdout),
				readError(proc.stderr),
			]);

			if (exitCode !== 0) {
				throw new Error(errorOutput || `Process exited with code ${exitCode}`);
			}
		} else {
			// 非テストタスクは通常通り実行
			const result = await $`sh -c "${task.command}"`.quiet();
			output = result.stdout.toString();
		}

		const duration = Math.round((performance.now() - startTime) / 1000);

		// プログレスバーをクリア
		if (isTestTask) {
			process.stdout.write('\r\x1b[K');
		}

		console.log(`${colors.green}✓ ${task.name} completed (${duration}s)${colors.reset}`);

		if (values.verbose && output) {
			console.log(colors.cyan + output + colors.reset);
		}

		return {
			name: task.name,
			success: true,
			duration,
			output,
		};
	} catch (error) {
		const duration = Math.round((performance.now() - startTime) / 1000);
		// biome-ignore lint/suspicious/noExplicitAny: Error handling
		const err = error as any;

		// プログレスバーをクリア
		process.stdout.write('\r\x1b[K');
		console.log(`${colors.red}✗ ${task.name} failed (${duration}s)${colors.reset}`);

		if (values.verbose && err.stdout) {
			console.log(colors.cyan + err.stdout.toString() + colors.reset);
		}
		if (err.stderr || err.message) {
			console.log(colors.red + (err.stderr?.toString() || err.message) + colors.reset);
		}

		return {
			name: task.name,
			success: false,
			duration,
			error: err.stderr?.toString() || err.message,
		};
	}
}

async function main() {
	console.log(`${colors.magenta}⚡ Bun CI Runner${colors.reset}`);
	console.log(`${colors.blue}🖥️  Using ${cpus().length} CPU cores${colors.reset}`);
	console.log();

	const startTime = performance.now();
	const results: Map<string, TaskResult> = new Map();
	const tasksToRun = filterTasks();

	// Run independent tasks in parallel
	const independentTasks = tasksToRun.filter((t) => !t.dependsOn || t.dependsOn.length === 0);
	const parallelResults = await Promise.all(independentTasks.map(runTask));

	// Store results
	parallelResults.forEach((result) => {
		results.set(result.name, result);
	});

	// Run dependent tasks if all prerequisites passed
	const dependentTasks = tasksToRun.filter((t) => t.dependsOn && t.dependsOn.length > 0);

	for (const task of dependentTasks) {
		// Check if all dependencies passed
		const dependenciesPassed = task.dependsOn?.every((dep) => {
			const depResult = results.get(dep);
			return depResult?.success;
		});

		if (dependenciesPassed) {
			const result = await runTask(task);
			results.set(task.name, result);
		} else {
			console.log(`${colors.red}✗ ${task.name} skipped due to failed dependencies${colors.reset}`);
			results.set(task.name, {
				name: task.name,
				success: false,
				duration: 0,
				error: 'Skipped due to failed dependencies',
			});
		}
	}

	const totalDuration = Math.round((performance.now() - startTime) / 1000);

	// Display summary
	console.log();
	console.log('=========================================');
	console.log('⚡ CI Summary');
	console.log('=========================================');

	let allPassed = true;
	tasksToRun.forEach((task) => {
		const result = results.get(task.name);
		const status = result?.success ? `${colors.green}✓` : `${colors.red}✗`;

		console.log(`${status} ${task.name}${colors.reset}`);

		if (!result?.success) {
			allPassed = false;
		}
	});

	console.log();
	console.log(`⏱️  Total time: ${totalDuration} seconds`);
	console.log();

	if (allPassed) {
		console.log(`${colors.green}🎉 All checks passed! Ready to push.${colors.reset}`);
		console.log();
		console.log('📝 Next steps:');
		console.log('1. git add -A');
		console.log('2. git commit -m "your commit message"');
		console.log('3. git push origin your-branch');
		console.log('4. Create a PR on GitHub');
		process.exit(0);
	} else {
		console.log(
			`${colors.red}❌ Some checks failed. Please fix the issues and try again.${colors.reset}`,
		);
		console.log();
		console.log('Failed tasks:');
		results.forEach((result) => {
			if (!result.success && result.error) {
				console.log(`${colors.red}${result.name}:${colors.reset}`);
				console.log(result.error.split('\n').slice(0, 5).join('\n'));
				console.log();
			}
		});
		process.exit(1);
	}
}

// Run the CI
await main();
