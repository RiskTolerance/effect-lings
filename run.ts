import {
	readdirSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
	watch
} from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, sep } from 'node:path'
import {
	currentStreak,
	emptyProgress,
	loadProgress,
	recordCompletion,
	saveProgress
} from './lib/progress'

const root = dirname(fileURLToPath(import.meta.url))
const exercisesDir = join(root, 'exercises')
const progressFile = join(root, 'progress.json')
const timeoutMs = 10_000

function filesIn(directory: string): string[] {
	return readdirSync(directory, {
		recursive: true,
		withFileTypes: true
	})
		.filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
		.map((entry) =>
			relative(directory, join(entry.parentPath, entry.name))
				.split(sep)
				.join('/')
		)
		.sort()
}

const pretty = (file: string) =>
	file.replaceAll('/', ' › ').replace(/\.ts$/, '')
const allExercises = () => filesIn(exercisesDir)
const progress = () => loadProgress(progressFile, allExercises())
const nextIncomplete = () => {
	const done = new Set(progress().completed)
	return allExercises().find((file) => !done.has(file))
}

function summary(): void {
	const p = progress()
	const total = allExercises().length
	const filled =
		total === 0 ? 0 : Math.round((p.completed.length / total) * 24)
	console.log(
		`\n🔥 ${currentStreak(p)}-day streak  ·  ${p.completed.length}/${total}  ${'█'.repeat(filled)}${'░'.repeat(24 - filled)}\n`
	)
}

async function runFile(
	file: string,
	signal?: AbortSignal
): Promise<boolean> {
	const child = Bun.spawn([process.execPath, file], {
		stdout: 'inherit',
		stderr: 'inherit',
		stdin: 'inherit'
	})
	const abort = () => child.kill('SIGKILL')
	signal?.addEventListener('abort', abort, { once: true })
	if (signal?.aborted) abort()
	let timedOut = false
	const timer = setTimeout(() => {
		timedOut = true
		child.kill('SIGKILL')
	}, timeoutMs)
	try {
		const status = await child.exited
		if (timedOut)
			console.error(
				'\nExercise timed out after 10 seconds. Check for an infinite loop or an Effect that never completes.'
			)
		return status === 0 && !timedOut && !signal?.aborted
	} finally {
		clearTimeout(timer)
		signal?.removeEventListener('abort', abort)
	}
}

async function practice(
	file: string,
	signal?: AbortSignal
): Promise<boolean> {
	console.log(`\n▶  ${pretty(file)}\n`)
	const passed = await runFile(join(exercisesDir, file), signal)
	if (signal?.aborted) return false
	if (passed) {
		saveProgress(progressFile, recordCompletion(progress(), file))
		summary()
		const next = nextIncomplete()
		console.log(
			next
				? `Next: ${pretty(next)}\n`
				: '🎉 All exercises complete.\n'
		)
	} else {
		console.log(
			`\nEdit exercises/${file} and try again.\nSolution: solutions/${file}\n`
		)
	}
	return passed
}

function selectExercise(raw: string | undefined): string | undefined {
	if (!raw) return undefined
	const file =
		raw
			.replaceAll('\\', '/')
			.replace(/^exercises\//, '')
			.replace(/\.ts$/, '') + '.ts'
	if (!allExercises().includes(file))
		throw new Error(
			`Unknown exercise: ${raw}. Run \`bun run list\` for paths.`
		)
	return file
}

async function cmdToday(file = nextIncomplete()): Promise<void> {
	if (!file) {
		summary()
		console.log('🎉 All exercises complete.')
		return
	}
	if (!(await practice(file))) process.exitCode = 1
}

async function cmdWatch(selected?: string): Promise<void> {
	let current = selected ?? nextIncomplete()
	if (!current) return cmdToday()
	console.log(
		'👀 Save to re-check. Passing work is saved automatically. Ctrl-C to stop.'
	)
	let running = false
	let pending = false
	let stopped = false
	let active: AbortController | undefined
	let timer: ReturnType<typeof setTimeout> | undefined
	let finish!: () => void
	const done = new Promise<void>((resolve) => {
		finish = resolve
	})
	const stop = () => {
		stopped = true
		clearTimeout(timer)
		active?.abort()
		finish()
	}
	const run = async () => {
		if (running || stopped) return
		running = true
		pending = false
		active = new AbortController()
		try {
			const passed = await practice(current!, active.signal)
			if (passed && !selected) {
				current = nextIncomplete()
				if (!current) stop()
				else pending = true
			}
		} catch (error) {
			console.error(error instanceof Error ? error.message : error)
			process.exitCode = 1
			stop()
		} finally {
			running = false
			if (pending && !stopped)
				timer = setTimeout(() => void run(), 100)
		}
	}
	const onSave = (_event: string, filename: string | null) => {
		if (filename && !filename.endsWith('.ts')) return
		pending = true
		active?.abort()
		clearTimeout(timer)
		timer = setTimeout(() => void run(), 100)
	}
	const watchers = [exercisesDir, join(root, 'lib')].map(
		(directory) => watch(directory, { recursive: true }, onSave)
	)
	for (const watcher of watchers)
		watcher.on('error', (error) => {
			console.error(error.message)
			process.exitCode = 1
			stop()
		})
	process.on('SIGINT', stop)
	process.on('SIGTERM', stop)
	try {
		void run()
		await done
	} finally {
		watchers.forEach((watcher) => watcher.close())
		process.off('SIGINT', stop)
		process.off('SIGTERM', stop)
	}
}

async function verify(): Promise<void> {
	const exercises = allExercises()
	const solutionsDir = join(root, 'solutions')
	const solutions = filesIn(solutionsDir)
	let failed = 0
	for (const file of new Set([...exercises, ...solutions])) {
		console.log(`\n▶  Solution: ${pretty(file)}`)
		if (
			!exercises.includes(file) ||
			!existsSync(join(solutionsDir, file))
		) {
			console.error('Missing matching exercise or solution.')
			failed++
		} else if (!(await runFile(join(solutionsDir, file)))) failed++
	}
	console.log(
		`\n${solutions.length} solutions checked; ${failed} failures. Progress unchanged.\n`
	)
	if (failed) process.exitCode = 1
}

function cmdReset(): void {
	const startersDir = join(root, 'starters')
	if (!existsSync(startersDir))
		throw new Error(
			'Missing starters/ directory. Restore it before resetting.'
		)
	const files = filesIn(startersDir)
	if (files.length === 0)
		throw new Error('No starter exercises found. Nothing was reset.')
	// Read every template before overwriting work. Reset works without Git and
	// restores deleted exercise files too. Files without a template are kept.
	const originals = files.map((file) => ({
		path: join(exercisesDir, file),
		contents: readFileSync(join(startersDir, file))
	}))
	for (const original of originals) {
		mkdirSync(dirname(original.path), { recursive: true })
		writeFileSync(original.path, original.contents)
	}
	saveProgress(progressFile, emptyProgress())
	console.log(
		`Restored ${files.length} exercises to their unsolved starters. Progress and streak cleared.`
	)
}

const help = `Usage: bun run.ts <command> [exercise path]

  today         Run the next unsolved exercise (default)
  run <path>    Practice a specific exercise, including completed ones
  watch [path]  Re-check on save; record passes and advance automatically
  list          Show exercise paths, progress, and current streak
  reset         Restore unsolved exercise files and clear progress + streak
  verify        Run every reference solution without changing progress
  help          Show this help

Example: bun run.ts run 03-effect-basics/04-pipe-and-map`

async function main(): Promise<void> {
	const [command = 'today', path, ...extra] = process.argv.slice(2)
	if (extra.length || (path && !['run', 'watch'].includes(command)))
		throw new Error(help)
	switch (command) {
		case 'today':
			return cmdToday()
		case 'run': {
			const file = selectExercise(path)
			if (!file)
				throw new Error(
					'Supply an exercise path. Run `bun run list` to see them.'
				)
			return cmdToday(file)
		}
		case 'watch':
			return cmdWatch(selectExercise(path))
		case 'list': {
			summary()
			const done = new Set(progress().completed)
			for (const file of allExercises())
				console.log(`  ${done.has(file) ? '✓' : '·'} ${file}`)
			return
		}
		case 'reset':
			return cmdReset()
		case 'verify':
			return verify()
		case 'help':
		case '--help':
		case '-h':
			console.log(help)
			return
		default:
			throw new Error(`Unknown command: ${command}\n\n${help}`)
	}
}

await main().catch((error) => {
	console.error(error instanceof Error ? error.message : error)
	process.exitCode = 1
})
