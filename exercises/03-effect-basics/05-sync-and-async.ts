import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section(
	'Lifting real work in: sync (never throws), try (might throw), tryPromise (async, might reject).'
)

/*
 * Before you start:
 * - Mental model: constructors lift real work into Effect. `sync` delays
 *   non-throwing sync work, `try` catches thrown sync errors, and `tryPromise`
 *   catches rejected promises.
 * - Shape to look for: wrap work in thunks so it stays lazy and errors land in
 *   the typed error channel.
 * - Docs: v4 API reference:
 *   https://effect-ts.github.io/effect/effect/Effect.ts.html
 *   Concept docs: https://effect.website/docs/getting-started/creating-effects
 */

let calls = 0

// 📝 TODO: wrap the side effect in Effect.sync so it stays lazy. It should do
//          `calls += 1` and return the new value of `calls`.
const tick: Effect.Effect<number> = Effect.sync(() => 0) // fix me

// 📝 TODO: parse JSON with Effect.try, using { try, catch } to map a thrown
//          error to the string "bad json".
const parse = (s: string): Effect.Effect<unknown, string> =>
	Effect.succeed(null) // fix me

// 📝 TODO: wrap a promise with Effect.tryPromise, mapping a rejection to "bad".
const fromPromise = (
	p: Promise<number>
): Effect.Effect<number, string> => Effect.succeed(0) // fix me

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
