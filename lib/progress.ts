import {
	existsSync,
	readFileSync,
	renameSync,
	writeFileSync
} from 'node:fs'

export type Progress = {
	completed: string[]
	streak: number
	lastCompletedDate: string
}

export const emptyProgress = (): Progress => ({
	completed: [],
	streak: 0,
	lastCompletedDate: ''
})

// Calendar days follow the learner's timezone, including 23/25-hour DST days.
export function localDate(date: Date): string {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, '0'),
		String(date.getDate()).padStart(2, '0')
	].join('-')
}

function yesterday(now: Date): string {
	const date = new Date(now)
	date.setDate(date.getDate() - 1)
	return localDate(date)
}

export function currentStreak(
	progress: Progress,
	now = new Date()
): number {
	return [localDate(now), yesterday(now)].includes(
		progress.lastCompletedDate
	)
		? progress.streak
		: 0
}

export function recordCompletion(
	progress: Progress,
	exercise: string,
	now = new Date()
): Progress {
	// Replaying a solved exercise should not earn another day of progress.
	if (progress.completed.includes(exercise)) return progress
	const today = localDate(now)
	return {
		completed: [...progress.completed, exercise],
		streak:
			progress.lastCompletedDate === today
				? progress.streak
				: progress.lastCompletedDate === yesterday(now)
					? progress.streak + 1
					: 1,
		lastCompletedDate: today
	}
}

export function loadProgress(
	file: string,
	exercises: readonly string[]
): Progress {
	if (!existsSync(file)) return emptyProgress()
	try {
		const value: unknown = JSON.parse(readFileSync(file, 'utf8'))
		if (typeof value !== 'object' || value === null)
			throw new Error('expected an object')
		const p = value as Record<string, unknown>
		if (
			!Array.isArray(p.completed) ||
			!p.completed.every((e) => typeof e === 'string') ||
			!Number.isSafeInteger(p.streak) ||
			(p.streak as number) < 0 ||
			typeof p.lastCompletedDate !== 'string' ||
			(p.lastCompletedDate !== '' &&
				(!/^\d{4}-\d{2}-\d{2}$/.test(p.lastCompletedDate) ||
					new Date(p.lastCompletedDate).toISOString().slice(0, 10) !==
						p.lastCompletedDate))
		) {
			throw new Error('invalid progress fields')
		}
		const available = new Set(exercises)
		return {
			completed: [
				...new Set(
					(p.completed as string[]).map((e) =>
						e.replaceAll('\\', '/')
					)
				)
			].filter((e) => available.has(e)),
			streak: p.streak as number,
			lastCompletedDate: p.lastCompletedDate
		}
	} catch (error) {
		// Never silently overwrite a malformed save on the next successful run.
		throw new Error(
			`Cannot read ${file}. Fix it or run \`bun run reset\` to restore all exercise files and clear progress.`,
			{ cause: error }
		)
	}
}

export function saveProgress(file: string, progress: Progress): void {
	const temporary = `${file}.${process.pid}.tmp`
	writeFileSync(temporary, JSON.stringify(progress, null, 2) + '\n')
	renameSync(temporary, file)
}
