import { expect, test } from 'bun:test'
import { join } from 'node:path'

const root = join(import.meta.dir, '..')
const filesIn = (directory: string) =>
	Array.from(
		new Bun.Glob('**/*.ts').scanSync(join(root, directory))
	).sort()
const starters = filesIn('starters')

test('every exercise and solution has an unsolved reset template', () => {
	expect(starters).toEqual(filesIn('exercises'))
	expect(starters).toEqual(filesIn('solutions'))
})

test.each(starters)(
	'starter %s fails as an unfinished exercise',
	(file) => {
		const result = Bun.spawnSync(
			[process.execPath, join(root, 'starters', file)],
			{
				stdout: 'pipe',
				stderr: 'pipe',
				timeout: 5000
			}
		)
		expect(result.exitCode).toBe(1)
		// A broken import or syntax error is not a valid unsolved exercise.
		expect(result.stderr.toString()).toMatch(/❌|TODO: implement/)
	}
)
