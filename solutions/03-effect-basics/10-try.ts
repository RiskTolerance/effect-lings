import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section('try turns a thrown exception into an expected failure.')

// Effect.try({ try: callback, catch: mapError }) delays the callback.
// If it throws, mapError produces the value in the Effect's error channel.
// The catch option returns a plain error value; Effect.catch later returns
// a recovery Effect. Here malformed JSON should fail with 'bad json'.

const parse = (s: string): Effect.Effect<unknown, string> =>
	Effect.try({ try: () => JSON.parse(s), catch: () => 'bad json' })

// ---- checks (don't edit) ----
check(
	'valid JSON succeeds',
	Effect.runSync(parse('[1,2,3]')),
	[1, 2, 3]
)
check(
	'a thrown parse error becomes recoverable',
	Effect.runSync(
		parse('nope').pipe(Effect.catch((error) => Effect.succeed(error)))
	),
	'bad json'
)
