import { Effect } from 'effect'
import { check, checkThrows, section } from '../../lib/check'
section('An Effect can describe an expected failure.')

// Effect.Effect<number, string> can succeed with a number or fail with a string.
// The second type parameter is the error type, often called E.
// Effect.fail(error) describes failure. Running an unhandled failure with
// runSync throws; checkThrows below checks that behavior for you.

const positive = (n: number): Effect.Effect<number, string> =>
	n > 0 ? Effect.succeed(n) : Effect.fail('not positive')

// ---- checks (don't edit) ----
check('positive input succeeds', Effect.runSync(positive(5)), 5)
checkThrows(
	'zero fails',
	() => Effect.runSync(positive(0)),
	'not positive'
)
checkThrows(
	'negative input fails',
	() => Effect.runSync(positive(-2)),
	'not positive'
)
