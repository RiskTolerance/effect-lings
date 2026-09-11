import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section('match turns either outcome into a plain value.')

// Recovery only changes failures. Effect.match transforms either outcome:
// onFailure receives the error; onSuccess receives the success value.
// Both callbacks return plain values, so we can turn either path into text.

const positive = (n: number): Effect.Effect<number, string> =>
	n > 0 ? Effect.succeed(n) : Effect.fail('not positive')

const describe = (n: number): Effect.Effect<string> =>
	positive(n).pipe(
		Effect.match({
			onFailure: (error) => `error: ${error}`,
			onSuccess: (value) => `ok: ${value}`
		})
	)

// ---- checks (don't edit) ----
check(
	'failure becomes text',
	Effect.runSync(describe(-2)),
	'error: not positive'
)
check('success becomes text', Effect.runSync(describe(7)), 'ok: 7')
