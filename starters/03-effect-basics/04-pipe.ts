import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section('pipe applies transformations from left to right.')

// program.pipe(Effect.map(f)) means Effect.map(program, f).
// With several arguments, each transformation receives the previous Effect.
// The maps below use ordinary numbers; pipe does not run the Effect.

const start = Effect.succeed(2)

// 📝 TODO: use start.pipe(...) with two maps: add 3, then multiply by 10.
const result: Effect.Effect<number> = Effect.succeed(0)

// ---- checks (don't edit) ----
check(
	'transformations run in the written order',
	Effect.runSync(result),
	50
)
