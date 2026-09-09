import { Cause, Effect, Exit, Option } from 'effect'
import { check, section } from '../../lib/check'
section(
	'Expected failures use E. Unexpected exceptions are defects, recorded in an Exit cause.'
)

/*
 * Before you start:
 * - `Effect.sync` does not promise that JavaScript cannot throw. A throw in its
 *   callback becomes a defect. `Effect.catch` handles expected errors only.
 * - `Effect.try` lets you classify a thrown exception as an expected error.
 * - `runPromiseExit` returns the full outcome without rejecting on failure.
 * - API: https://effect-ts.github.io/effect/effect/Exit.ts.html
 *        https://effect-ts.github.io/effect/effect/Cause.ts.html
 */

const explode = (): never => {
	throw new Error('boom')
}

// 📝 TODO: wrap explode in Effect.try; map the throw to the string 'bad input'.
const expected: Effect.Effect<never, string> = Effect.try({
	try: explode,
	catch: () => 'bad input'
})

// 📝 TODO: wrap explode in Effect.sync. Its E channel remains never because a
//          defect is different from an expected failure.
const unexpected: Effect.Effect<unknown> = Effect.sync(explode)

// ---- checks (don't edit) ----
check(
	'try turns the exception into a recoverable error',
	await Effect.runPromise(
		expected.pipe(Effect.catch((error) => Effect.succeed(error)))
	),
	'bad input'
)
let recoveredDefect = false
const exit = await Effect.runPromiseExit(
	unexpected.pipe(
		Effect.catch(() => {
			recoveredDefect = true
			return Effect.succeed('recovered')
		})
	)
)
check(
	'a throw inside sync still fails the running Effect',
	Exit.isFailure(exit),
	true
)
check('catch does not recover defects', recoveredDefect, false)
check(
	'a defect is not an expected error in the cause',
	Exit.isFailure(exit) &&
		Option.isNone(Cause.findErrorOption(exit.cause)),
	true
)
