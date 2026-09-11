import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section('tryPromise wraps work that produces a Promise.')

// Like try, tryPromise maps an error into the expected failure channel.
// Its try callback creates a Promise each time the Effect runs.
// Run async Effects with await Effect.runPromise(program): it returns a
// Promise for the answer. The Effect itself is still a description.

// 📝 TODO: use Effect.tryPromise with try: makePromise and catch: () => 'bad'.
const fromPromise = (
	makePromise: () => Promise<number>
): Effect.Effect<number, string> => Effect.succeed(0)

// ---- checks (don't edit) ----
let calls = 0
const program = fromPromise(() => Promise.resolve(++calls))
check('construction does not create a Promise', calls, 0)
check(
	'first run awaits the answer',
	await Effect.runPromise(program),
	1
)
check(
	'another run creates fresh work',
	await Effect.runPromise(program),
	2
)
check(
	'rejection becomes recoverable',
	await Effect.runPromise(
		fromPromise(() => Promise.reject('offline')).pipe(
			Effect.catch((error) => Effect.succeed(error))
		)
	),
	'bad'
)
