import { afterEach, expect, test } from 'bun:test'
import {
	copyFileSync,
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const directories: string[] = []
const children = new Set<ReturnType<typeof Bun.spawn>>()
afterEach(async () => {
	for (const child of children) child.kill('SIGKILL')
	await Promise.all([...children].map((child) => child.exited))
	children.clear()
	directories
		.splice(0)
		.forEach((dir) => rmSync(dir, { recursive: true, force: true }))
})

function fixture(exercises: Record<string, string>) {
	const dir = mkdtempSync(join(tmpdir(), 'effect-runner-'))
	directories.push(dir)
	copyFileSync(
		join(import.meta.dir, '../run.ts'),
		join(dir, 'run.ts')
	)
	cpSync(join(import.meta.dir, '../lib'), join(dir, 'lib'), {
		recursive: true
	})
	mkdirSync(join(dir, 'exercises'))
	mkdirSync(join(dir, 'solutions'))
	for (const [file, source] of Object.entries(exercises)) {
		mkdirSync(dirname(join(dir, 'exercises', file)), {
			recursive: true
		})
		writeFileSync(join(dir, 'exercises', file), source)
	}
	cpSync(join(dir, 'exercises'), join(dir, 'starters'), {
		recursive: true
	})
	return dir
}

function spawn(dir: string, ...args: string[]) {
	const child = Bun.spawn(
		[process.execPath, join(dir, 'run.ts'), ...args],
		{ cwd: dir, stdout: 'pipe', stderr: 'pipe' }
	)
	children.add(child)
	return child
}
async function run(dir: string, ...args: string[]) {
	const child = spawn(dir, ...args)
	const [status, stdout, stderr] = await Promise.all([
		child.exited,
		new Response(child.stdout).text(),
		new Response(child.stderr).text()
	])
	return { status, output: stdout + stderr }
}
const progress = (dir: string) =>
	JSON.parse(readFileSync(join(dir, 'progress.json'), 'utf8'))
async function until(predicate: () => boolean) {
	const deadline = Date.now() + 5000
	while (!predicate()) {
		if (Date.now() > deadline)
			throw new Error('Timed out waiting for watch mode')
		await Bun.sleep(20)
	}
}

test('today records only passes and advances in path order', async () => {
	const dir = fixture({
		'02.ts': 'process.exit(1)',
		'01.ts': 'console.log("passed")'
	})
	expect((await run(dir, 'today')).status).toBe(0)
	expect(progress(dir).completed).toEqual(['01.ts'])
	expect((await run(dir, 'today')).status).toBe(1)
	expect(progress(dir).completed).toEqual(['01.ts'])
})

test('run selects a path without skipping unfinished exercises; rejects traversal', async () => {
	const dir = fixture({ '01.ts': 'process.exit(1)', '02.ts': '' })
	expect((await run(dir, 'run', 'exercises/02')).status).toBe(0)
	expect(progress(dir).completed).toEqual(['02.ts'])
	expect((await run(dir, 'run', '../run')).status).toBe(1)
	expect((await run(dir, 'run')).status).toBe(1)
})

test('unknown commands fail instead of running an exercise', async () => {
	const dir = fixture({ '01.ts': '' })
	expect((await run(dir, 'typo')).status).toBe(1)
	expect(existsSync(join(dir, 'progress.json'))).toBe(false)
})

test('malformed progress is preserved; reset explicitly clears it', async () => {
	const dir = fixture({ '01.ts': 'process.exit(1)' })
	writeFileSync(join(dir, 'progress.json'), 'bad json')
	expect((await run(dir, 'today')).output).toContain('Cannot read')
	expect(readFileSync(join(dir, 'progress.json'), 'utf8')).toBe(
		'bad json'
	)
	expect((await run(dir, 'reset')).status).toBe(0)
	expect(progress(dir).completed).toEqual([])
	expect(readFileSync(join(dir, 'exercises/01.ts'), 'utf8')).toBe(
		'process.exit(1)'
	)
})

test('reset restores edited and deleted exercises, clears progress, and keeps custom files', async () => {
	const dir = fixture({
		'01.ts': 'process.exit(1)',
		'group/02.ts': '// TODO\nprocess.exit(1)'
	})
	writeFileSync(join(dir, 'exercises/01.ts'), '// solved')
	rmSync(join(dir, 'exercises/group'), { recursive: true })
	writeFileSync(
		join(dir, 'exercises/custom.ts'),
		'// my extra exercise'
	)
	writeFileSync(join(dir, 'solutions/01.ts'), '// solution')
	writeFileSync(
		join(dir, 'progress.json'),
		JSON.stringify({
			completed: ['01.ts'],
			streak: 3,
			lastCompletedDate: '2026-09-09'
		})
	)
	for (let i = 0; i < 2; i++) {
		const result = await run(dir, 'reset')
		expect(result.status).toBe(0)
		expect(result.output).toContain('Restored 2 exercises')
		expect(readFileSync(join(dir, 'exercises/01.ts'), 'utf8')).toBe(
			'process.exit(1)'
		)
		expect(
			readFileSync(join(dir, 'exercises/group/02.ts'), 'utf8')
		).toBe('// TODO\nprocess.exit(1)')
		expect(progress(dir)).toEqual({
			completed: [],
			streak: 0,
			lastCompletedDate: ''
		})
	}
	expect(readFileSync(join(dir, 'exercises/custom.ts'), 'utf8')).toBe(
		'// my extra exercise'
	)
	expect(readFileSync(join(dir, 'solutions/01.ts'), 'utf8')).toBe(
		'// solution'
	)
	expect(readFileSync(join(dir, 'starters/01.ts'), 'utf8')).toBe(
		'process.exit(1)'
	)
	expect((await run(dir, 'today')).status).toBe(1)
})

test('reset recreates a completely deleted exercises directory', async () => {
	const dir = fixture({ 'group/01.ts': 'process.exit(1)' })
	rmSync(join(dir, 'exercises'), { recursive: true })
	expect((await run(dir, 'reset')).status).toBe(0)
	expect(
		readFileSync(join(dir, 'exercises/group/01.ts'), 'utf8')
	).toBe('process.exit(1)')
})

test.each(['missing', 'empty'])(
	'reset with %s starters fails without clearing work or progress',
	async (state) => {
		const dir = fixture({ '01.ts': '// solved' })
		writeFileSync(join(dir, 'progress.json'), 'preserve this save')
		rmSync(join(dir, 'starters'), { recursive: true })
		if (state === 'empty') mkdirSync(join(dir, 'starters'))
		expect((await run(dir, 'reset')).status).toBe(1)
		expect(readFileSync(join(dir, 'exercises/01.ts'), 'utf8')).toBe(
			'// solved'
		)
		expect(readFileSync(join(dir, 'progress.json'), 'utf8')).toBe(
			'preserve this save'
		)
	}
)

test('verify checks all solutions and matching paths without touching progress', async () => {
	const dir = fixture({ '01.ts': 'process.exit(1)', '02.ts': '' })
	writeFileSync(join(dir, 'solutions/01.ts'), '')
	writeFileSync(join(dir, 'solutions/02.ts'), '')
	writeFileSync(
		join(dir, 'progress.json'),
		'preserve even malformed progress'
	)
	expect((await run(dir, 'verify')).status).toBe(0)
	writeFileSync(join(dir, 'solutions/02.ts'), 'process.exit(1)')
	expect((await run(dir, 'verify')).status).toBe(1)
	rmSync(join(dir, 'solutions/02.ts'))
	expect((await run(dir, 'verify')).output).toContain(
		'Missing matching'
	)
	expect(readFileSync(join(dir, 'progress.json'), 'utf8')).toBe(
		'preserve even malformed progress'
	)
})

test('watch handles atomic saves, records passing work, and advances', async () => {
	const dir = fixture({
		'01.ts': 'console.log("WAITING"); process.exit(1)',
		'02.ts': ''
	})
	const child = spawn(dir, 'watch')
	let output = ''
	const reading = (async () => {
		for await (const chunk of child.stdout as ReadableStream<Uint8Array>)
			output += new TextDecoder().decode(chunk)
	})()
	await until(() => output.includes('WAITING'))
	writeFileSync(join(dir, 'exercises/01.tmp'), '')
	renameSync(
		join(dir, 'exercises/01.tmp'),
		join(dir, 'exercises/01.ts')
	)
	await until(
		() =>
			existsSync(join(dir, 'progress.json')) &&
			progress(dir).completed.length === 2
	)
	expect(await child.exited).toBe(0)
	await reading
	expect(progress(dir).completed).toEqual(['01.ts', '02.ts'])
}, 10_000)

test('watch interrupts a stuck run on save and can stop cleanly', async () => {
	const dir = fixture({
		'01.ts': 'console.log("RUNNING"); while (true) {}'
	})
	const child = spawn(dir, 'watch', '01')
	let output = ''
	const reading = (async () => {
		for await (const chunk of child.stdout as ReadableStream<Uint8Array>)
			output += new TextDecoder().decode(chunk)
	})()
	await until(() => output.includes('RUNNING'))
	writeFileSync(join(dir, 'exercises/01.ts'), '')
	await until(() => existsSync(join(dir, 'progress.json')))
	child.kill('SIGTERM')
	expect(await child.exited).toBe(0)
	await reading
	expect(progress(dir).completed).toEqual(['01.ts'])
}, 10_000)

test('an infinite loop times out and is never marked complete', async () => {
	const dir = fixture({ '01.ts': 'while (true) {}' })
	const result = await run(dir, 'today')
	expect(result.status).toBe(1)
	expect(result.output).toContain('timed out')
	expect(existsSync(join(dir, 'progress.json'))).toBe(false)
}, 15_000)
