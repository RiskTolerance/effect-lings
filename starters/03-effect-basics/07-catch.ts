import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section('Recover a failure by returning another Effect.')

// Effect.catch receives an expected error and returns a recovery Effect.
// Successes pass through unchanged. Recovering with Effect.succeed removes
// the error: Effect.Effect<number> is shorthand for no expected failures.

const positive = (n: number): Effect.Effect<number, string> =>
	n > 0 ? Effect.succeed(n) : Effect.fail('not positive')

// 📝 TODO: use positive(n).pipe(Effect.catch(...)) to recover with 0.
const safe = (n: number): Effect.Effect<number> => Effect.succeed(-1)

// ---- checks (don't edit) ----
check('failure recovers to zero', Effect.runSync(safe(-2)), 0)
check('success keeps its value', Effect.runSync(safe(5)), 5)
