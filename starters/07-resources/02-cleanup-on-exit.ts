import { Deferred, Effect, Exit, Fiber } from 'effect'
import { check, section } from '../../lib/check'
section(
	'Scopes release resources after failure and interruption, as well as success.'
)

/*
 * Before you start:
 * - Register release with acquireRelease, then run the body inside scoped.
 * - Failure short-circuits normal steps; cleanup still runs when the scope closes.
 * - Interrupting a fiber waits for its cleanup. A Deferred is a one-time signal;
 *   the checks use one to interrupt only AFTER acquisition, without timing guesses.
 * - API: https://effect-ts.github.io/effect/effect/Effect.ts.html
 *        https://effect-ts.github.io/effect/effect/Fiber.ts.html
 */

// 📝 TODO: open a scope, acquire a resource (append 'open' to log), register
//          release (append 'close'), then yield* body. Do not call release by hand.
const withConnection = (
	body: Effect.Effect<void, string>,
	log: string[]
): Effect.Effect<void, string> => body // fix me

// ---- checks (don't edit) ----
const successLog: string[] = []
await Effect.runPromise(
	withConnection(
		Effect.sync(() => {
			successLog.push('use')
		}),
		successLog
	)
)
check('release follows successful use', successLog, [
	'open',
	'use',
	'close'
])

const failureLog: string[] = []
const failed = await Effect.runPromiseExit(
	withConnection(Effect.fail('query failed'), failureLog)
)
check('the body still fails', Exit.isFailure(failed), true)
check('release runs on failure', failureLog, ['open', 'close'])

const interruptLog: string[] = []
await Effect.runPromise(
	Effect.gen(function* () {
		const ready = yield* Deferred.make<void>()
		const body = Effect.gen(function* () {
			yield* Deferred.succeed(ready, undefined)
			yield* Effect.never
		})
		const fiber = yield* Effect.forkChild(
			withConnection(body, interruptLog)
		)
		yield* Deferred.await(ready)
		yield* Fiber.interrupt(fiber)
		interruptLog.push('interrupted')
	})
)
check('interrupt waits for release to complete', interruptLog, [
	'open',
	'close',
	'interrupted'
])
