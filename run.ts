// The whole point of this file: remove every decision between you and practice.
// `bun start` runs the next thing. That's it. No choosing, no setup.

import { spawnSync } from 'node:child_process'
import {
	readdirSync,
	readFileSync,
	writeFileSync,
	existsSync
} from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, sep } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))
const exercisesDir = join(root, 'exercises')
const progressFile = join(root, 'progress.json')
// Under Bun, process.execPath IS the bun binary — spawn it directly to run an
// exercise. No PATH lookup, no node_modules/.bin, no separate runner to install.
const bunBin = process.execPath

type Progress = {
	completed: string[]
	streak: number
	lastCompletedDate: string
}

function loadProgress(): Progress {
	if (!existsSync(progressFile))
		return { completed: [], streak: 0, lastCompletedDate: '' }
	try {
		return JSON.parse(readFileSync(progressFile, 'utf8')) as Progress
	} catch {
		return { completed: [], streak: 0, lastCompletedDate: '' }
	}
}

function saveProgress(p: Progress): void {
	writeFileSync(progressFile, JSON.stringify(p, null, 2) + '\n')
}

function allExercises(): string[] {
	return readdirSync(exercisesDir, {
		recursive: true,
		withFileTypes: true
	})
		.filter((d) => d.isFile() && d.name.endsWith('.ts'))
		.map((d) =>
			relative(
				exercisesDir,
				join((d as any).parentPath ?? (d as any).path, d.name)
			)
		)
		.sort()
}

function pretty(rel: string): string {
	return rel.split(sep).join(' › ').replace(/\.ts$/, '')
}

function isoDate(d: Date): string {
	return d.toISOString().slice(0, 10)
}

function nextIncomplete(p: Progress): string | undefined {
	const done = new Set(p.completed)
	return allExercises().find((e) => !done.has(e))
}

function runFile(rel: string): number {
	const res = spawnSync(bunBin, [join(exercisesDir, rel)], {
		stdio: 'inherit'
	})
	return res.status ?? 1
}

function recordCompletion(p: Progress, rel: string): void {
	if (!p.completed.includes(rel)) p.completed.push(rel)
	const today = isoDate(new Date())
	const yesterday = isoDate(new Date(Date.now() - 86_400_000))
	if (p.lastCompletedDate !== today) {
		p.streak = p.lastCompletedDate === yesterday ? p.streak + 1 : 1
		p.lastCompletedDate = today
	}
	saveProgress(p)
}

function bar(done: number, total: number): string {
	const width = 24
	const filled = total === 0 ? 0 : Math.round((done / total) * width)
	return '█'.repeat(filled) + '░'.repeat(width - filled)
}

function cmdToday(): void {
	const p = loadProgress()
	const next = nextIncomplete(p)
	const all = allExercises()

	if (!next) {
		console.log(`\n🎉  You've cleared all ${all.length} exercises.`)
		console.log(
			`Add another file under exercises/ and keep the streak alive (${p.streak} days).\n`
		)
		return
	}

	console.log(`\n▶  ${pretty(next)}\n`)
	const status = runFile(next)

	if (status === 0) {
		const wasNew = !p.completed.includes(next)
		recordCompletion(p, next)
		if (wasNew) {
			const upcoming = nextIncomplete(p)
			console.log(
				`🔥  ${p.streak}-day streak  ·  ${p.completed.length}/${all.length}  ${bar(p.completed.length, all.length)}`
			)
			console.log(
				upcoming
					? `Next: ${pretty(upcoming)} — run \`bun start\` again when you're ready.\n`
					: `That was the last one. 🎉\n`
			)
		}
	} else {
		console.log(
			`\n— not passing yet. Edit exercises/${next}, then run \`bun start\` again.`
		)
		console.log(
			`   (Or \`bun run watch\` to re-check automatically on every save.)\n`
		)
		process.exitCode = 1
	}
}

function cmdWatch(): void {
	const next = nextIncomplete(loadProgress())
	if (!next) return cmdToday()
	console.log(
		`\n👀  Watching ${pretty(next)} — save the file to re-check. Ctrl-C to stop.`
	)
	console.log(
		`   When it goes green, stop and run \`bun start\` to record it.\n`
	)
	spawnSync(bunBin, ['--watch', join(exercisesDir, next)], {
		stdio: 'inherit'
	})
}

function cmdList(): void {
	const p = loadProgress()
	const done = new Set(p.completed)
	const all = allExercises()
	console.log(
		`\n🔥 ${p.streak}-day streak  ·  ${done.size}/${all.length}  ${bar(done.size, all.length)}\n`
	)
	let lastGroup = ''
	for (const e of all) {
		const group = e.split(sep)[0] ?? ''
		if (group !== lastGroup) {
			console.log(`  ${group}`)
			lastGroup = group
		}
		console.log(
			`    ${done.has(e) ? '✓' : '·'} ${e.split(sep).slice(1).join(sep).replace(/\.ts$/, '')}`
		)
	}
	console.log('')
}

function cmdReset(): void {
	saveProgress({ completed: [], streak: 0, lastCompletedDate: '' })
	console.log('Progress reset. Streak cleared.\n')
}

const cmd = process.argv[2] ?? 'today'
;(
	({
		today: cmdToday,
		watch: cmdWatch,
		list: cmdList,
		reset: cmdReset
	})[cmd] ?? cmdToday
)()
