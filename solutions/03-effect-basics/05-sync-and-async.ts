import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section(
	'Lifting real work in: sync (never throws), try (might throw), tryPromise (async, might reject).'
)

let calls = 0

// sync: for side-effecting code you trust not to throw. Still lazy — the body
// runs only when the Effect is run, and once per run.
const tick: Effect.Effect<number> = Effect.sync(() => {
	calls += 1
	return calls
})

// try: for code that might throw. `catch` turns the thrown value into the typed
// error channel instead of an unhandled exception.
const parse = (s: string): Effect.Effect<unknown, string> =>
	Effect.try({ try: () => JSON.parse(s), catch: () => 'bad json' })

// tryPromise: the async sibling of try. `catch` maps a rejection to the E channel.
const fromPromise = (
	p: Promise<number>
): Effect.Effect<number, string> =>
	Effect.tryPromise({ try: () => p, catch: () => 'bad' })

// ---- checks (don't edit) ----
check('sync is lazy: defining tick did not run it', calls, 0)
check(
	'running tick twice bumps the counter',
	[Effect.runSync(tick), Effect.runSync(tick)],
	[1, 2]
)
check(
	'try maps a parse success',
	Effect.runSync(
		parse('[1,2,3]').pipe(Effect.map((v) => (v as number[]).length))
	),
	3
)
check(
	'try maps a throw to a typed error',
	Effect.runSync(
		parse('nope').pipe(Effect.catch((e) => Effect.succeed(e)))
	),
	'bad json'
)
check(
	'tryPromise resolves to the value',
	await Effect.runPromise(fromPromise(Promise.resolve(9))),
	9
)
check(
	'tryPromise maps a rejection',
	await Effect.runPromise(
		fromPromise(Promise.reject('x')).pipe(
			Effect.catch((e) => Effect.succeed(e))
		)
	),
	'bad'
)
