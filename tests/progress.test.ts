import { afterAll, afterEach, describe, expect, test } from 'bun:test'
import {
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
	currentStreak,
	emptyProgress,
	loadProgress,
	localDate,
	recordCompletion,
	saveProgress
} from '../lib/progress'

const originalTimezone = process.env.TZ
process.env.TZ = 'America/Chicago'
afterAll(() => {
	if (originalTimezone === undefined) delete process.env.TZ
	else process.env.TZ = originalTimezone
})
const directories: string[] = []
afterEach(() =>
	directories
		.splice(0)
		.forEach((dir) => rmSync(dir, { recursive: true, force: true }))
)
const saveFile = () => {
	const dir = mkdtempSync(join(tmpdir(), 'effect-progress-'))
	directories.push(dir)
	return join(dir, 'progress.json')
}

describe('local calendar streaks', () => {
	test('uses the local date when UTC is already tomorrow', () => {
		expect(localDate(new Date('2026-09-09T02:00:00Z'))).toBe(
			'2026-09-08'
		)
	})
	test.each([
		['2026-03-08', '2026-03-09T00:30:00'],
		['2026-11-01', '2026-11-02T00:30:00'],
		['2026-12-31', '2027-01-01T00:30:00']
	])(
		'continues from %s across DST/year boundaries',
		(lastCompletedDate, time) => {
			const p = {
				completed: ['one.ts'],
				streak: 2,
				lastCompletedDate
			}
			expect(
				recordCompletion(p, 'two.ts', new Date(time)).streak
			).toBe(3)
		}
	)
	test('multiple completions today count as one day; replay earns nothing', () => {
		const now = new Date('2026-09-09T12:00:00')
		const first = recordCompletion(emptyProgress(), 'one.ts', now)
		const second = recordCompletion(first, 'two.ts', now)
		expect(second.streak).toBe(1)
		expect(
			recordCompletion(
				second,
				'one.ts',
				new Date('2026-09-10T12:00:00')
			)
		).toEqual(second)
		expect(first.completed).toEqual(['one.ts'])
	})
	test('expires a stale displayed streak and restarts after a missed day', () => {
		const p = {
			completed: ['one.ts'],
			streak: 8,
			lastCompletedDate: '2026-09-07'
		}
		const now = new Date('2026-09-09T12:00:00')
		expect(currentStreak(p, now)).toBe(0)
		expect(currentStreak(p, new Date('2026-09-08T23:00:00'))).toBe(8)
		expect(recordCompletion(p, 'two.ts', now).streak).toBe(1)
	})
})

test('save round-trips; removed and duplicated paths do not inflate progress', () => {
	const file = saveFile()
	expect(loadProgress(file, [])).toEqual(emptyProgress())
	saveProgress(file, {
		completed: ['one\\a.ts', 'one/a.ts', 'removed.ts'],
		streak: 1,
		lastCompletedDate: '2026-09-09'
	})
	expect(loadProgress(file, ['one/a.ts']).completed).toEqual([
		'one/a.ts'
	])
})

test.each([
	'{',
	'null',
	'[]',
	'{"completed": [1]}',
	'{"completed": [], "streak": -1, "lastCompletedDate": ""}',
	'{"completed": [], "streak": 1, "lastCompletedDate": "2026-02-30"}'
])(
	'rejects malformed progress without overwriting it: %s',
	(contents) => {
		const file = saveFile()
		writeFileSync(file, contents)
		expect(() => loadProgress(file, [])).toThrow('Cannot read')
		expect(readFileSync(file, 'utf8')).toBe(contents)
	}
)
