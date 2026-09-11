import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section('pipe applies transformations from left to right.')

// program.pipe(Effect.map(f)) means Effect.map(program, f).
// With several arguments, each transformation receives the previous Effect.
// The maps below use ordinary numbers; pipe does not run the Effect.

const start = Effect.succeed(2)

const result = start.pipe(
	Effect.map((n) => n + 3),
	Effect.map((n) => n * 10)
)

// ---- checks (don't edit) ----
check(
	'transformations run in the written order',
	Effect.runSync(result),
	50
)
