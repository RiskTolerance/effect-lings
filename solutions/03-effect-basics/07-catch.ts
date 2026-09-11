import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section('Recover a failure by returning another Effect.')

// Effect.catch receives an expected error and returns a recovery Effect.
// Successes pass through unchanged. Recovering with Effect.succeed removes
// the error: Effect.Effect<number> is shorthand for no expected failures.

const positive = (n: number): Effect.Effect<number, string> =>
	n > 0 ? Effect.succeed(n) : Effect.fail('not positive')

const safe = (n: number): Effect.Effect<number> =>
	positive(n).pipe(Effect.catch(() => Effect.succeed(0)))

// ---- checks (don't edit) ----
check('failure recovers to zero', Effect.runSync(safe(-2)), 0)
check('success keeps its value', Effect.runSync(safe(5)), 5)
