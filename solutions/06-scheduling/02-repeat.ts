import { Effect, Ref, Schedule } from 'effect'
import { check, section } from '../../lib/check'
section(
	'repeat re-runs a SUCCEEDING Effect according to a Schedule. recurs(n) repeats n more times (n+1 runs total).'
)

const program = Effect.gen(function* () {
	const count = yield* Ref.make(0)
	const bump = Ref.update(count, (n) => n + 1)

	// The effect runs once, then the schedule decides whether to run it again.
	// recurs(3) says "repeat 3 more times" → 4 runs, so count ends at 4.
	yield* Effect.repeat(bump, Schedule.recurs(3))

	return yield* Ref.get(count)
})

// ---- checks (don't edit) ----
check(
	'repeat runs the effect n+1 times (1 initial + 3 repeats)',
	await Effect.runPromise(program),
	4
)
