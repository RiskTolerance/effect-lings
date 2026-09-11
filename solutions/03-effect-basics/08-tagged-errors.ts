import { Effect, Data } from 'effect'
import { check, checkThrows, section } from '../../lib/check'
section('Use an error’s tag to choose which failure to recover.')

// Data.TaggedError creates error objects with a _tag label and named fields.
// The supplied TooSmall class has _tag: 'TooSmall' and a numeric value field.
// catchTag works like catch, but only for the named tag; its callback can
// read that error's fields. Other errors continue as failures.

class TooSmall extends Data.TaggedError('TooSmall')<{
	value: number
}> {}
class Offline extends Data.TaggedError('Offline')<{}> {}

type Problem = TooSmall | Offline
const positive = (n: number): Effect.Effect<number, Problem> =>
	n > 0 ? Effect.succeed(n) : Effect.fail(new TooSmall({ value: n }))

const recover = (
	program: Effect.Effect<number, Problem>
): Effect.Effect<number | string, Problem> =>
	program.pipe(
		Effect.catchTag('TooSmall', (error) =>
			Effect.succeed(`too small: ${error.value}`)
		)
	)

// ---- checks (don't edit) ----
check(
	'matching tag exposes its fields',
	Effect.runSync(recover(positive(-3))),
	'too small: -3'
)
check('success is unchanged', Effect.runSync(recover(positive(5))), 5)
checkThrows('unmatched errors still fail', () =>
	Effect.runSync(recover(Effect.fail(new Offline())))
)
