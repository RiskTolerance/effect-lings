import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section(
	'race waits for the first SUCCESS; raceFirst takes the first completion, including failure.'
)

/*
 * Before you start:
 * - `race` waits for a success even if another contender fails first. It fails
 *   only when both fail. `raceFirst` can fail as soon as one contender fails.
 * - Both interrupt remaining contenders once a winner is selected.
 * - Try predicting both outcomes before running the checks.
 * - API: https://effect-ts.github.io/effect/effect/Effect.ts.html
 */

const fastFailure = Effect.fail('offline')
const slowSuccess = Effect.succeed('online').pipe(
	Effect.delay('10 millis')
)

// 📝 TODO: race fastFailure against slowSuccess with Effect.race.
const firstSuccess: Effect.Effect<string, string> = Effect.race(
	fastFailure,
	slowSuccess
)

// 📝 TODO: use Effect.raceFirst with the same two contenders.
const firstCompletion: Effect.Effect<string, string> =
	Effect.raceFirst(fastFailure, slowSuccess)

// ---- checks (don't edit) ----
const describe = (effect: Effect.Effect<string, string>) =>
	Effect.runPromise(
		effect.pipe(
			Effect.match({
				onFailure: (error) => `failure: ${error}`,
				onSuccess: (value) => `success: ${value}`
			})
		)
	)
check(
	'race keeps waiting after the early failure',
	await describe(firstSuccess),
	'success: online'
)
check(
	'raceFirst preserves the early failure',
	await describe(firstCompletion),
	'failure: offline'
)
