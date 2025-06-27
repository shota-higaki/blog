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
	{
		name: 'build',
		command: 'bun run build',
		dependsOn: ['typecheck', 'lint', 'format'],
		timeout: 30000, // 30秒
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
  bun run ci --only lint,test      # Run only lint and test
  bun run ci --skip test           # Run all tasks except test
  bun run ci --verbose             # Show detailed output
`);
	process.exit(0);
}

// Filter tasks based on options
function filterTasks(): Task[] {
	let filteredTasks = [...tasks];

	if (values.only) {
		const onlyTasks = values.only.split(',').map((t) => t.trim());
		filteredTasks = filteredTasks.filter((t) => onlyTasks.includes(t.name));
	}

	if (values.skip) {
		const skipTasks = values.skip.split(',').map((t) => t.trim());
		filteredTasks = filteredTasks.filter((t) => !skipTasks.includes(t.name));
	}

	return filteredTasks;
}

async function runTask(task: Task): Promise<TaskResult> {
	const startTime = performance.now();
	console.log(`${colors.yellow}▶ Starting: ${task.name}${colors.reset}`);

	try {
		// タイムアウト付きでコマンドを実行
		const proc = $`sh -c "${task.command}"`.quiet();

		// タイムアウトを設定
		const timeout = task.timeout || 20000; // デフォルト20秒
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(
				() => reject(new Error(`Task ${task.name} timed out after ${timeout / 1000}s`)),
				timeout,
			);
		});

		// タイムアウトとコマンド実行を競争させる
		const result = await Promise.race([proc, timeoutPromise]);
		const duration = Math.round((performance.now() - startTime) / 1000);

		console.log(`${colors.green}✓ ${task.name} completed (${duration}s)${colors.reset}`);

		if (values.verbose && result.stdout) {
			console.log(colors.cyan + result.stdout.toString() + colors.reset);
		}

		return {
			name: task.name,
			success: true,
			duration,
			output: result.stdout.toString(),
		};
	} catch (error) {
		const duration = Math.round((performance.now() - startTime) / 1000);
		const err = error as any;

		console.log(`${colors.red}✗ ${task.name} failed (${duration}s)${colors.reset}`);

		if (values.verbose && err.stdout) {
			console.log(colors.cyan + err.stdout.toString() + colors.reset);
		}
		if (err.stderr) {
			console.log(colors.red + err.stderr.toString() + colors.reset);
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
