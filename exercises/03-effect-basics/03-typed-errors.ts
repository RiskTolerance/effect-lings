import { Effect, Data } from 'effect'
import { check, section } from '../../lib/check'
import { error } from 'node:console'
section(
	'The E channel: errors live in the type. Data.TaggedError = typed, matchable failures.'
)

/*
 * Before you start:
 * - Mental model: expected failures are values in the `E` channel, not thrown
 *   exceptions. Tagged errors give those values a stable `_tag` for recovery.
 * - Shape to look for: choose between `Effect.succeed` and `Effect.fail`, then
 *   recover only the matching tag with `Effect.catchTag`.
 * - Docs: v4 API references:
 *   https://effect-ts.github.io/effect/effect/Effect.ts.html
 *   https://effect-ts.github.io/effect/effect/Data.ts.html
 *   Concept docs: https://effect.website/docs/error-management/expected-errors
 */

class TooSmall extends Data.TaggedError('TooSmall')<{
	value: number
}> {}

// 📝 TODO: return Effect.succeed(n) when n > 0, otherwise
//          Effect.fail(new TooSmall({ value: n })).
//          Tip: annotate the return type as `Effect.Effect<number, TooSmall>`
//          so the success/failure branches unify into one Effect.
const ensurePositive = (
	n: number
): Effect.Effect<number, TooSmall> =>
	n > 0 ? Effect.succeed(n) : Effect.fail(new TooSmall({ value: n }))

// ---- checks (don't edit) ----
check(
	'happy path returns the value',
	Effect.runSync(ensurePositive(5)),
	5
)

// 📝 TODO: recover from the failure using .pipe(Effect.catchTag("TooSmall", ...))
//          returning `too small: <value>`.
const recovered = ensurePositive(-3).pipe(
	Effect.catchTag('TooSmall', (e) =>
		Effect.succeed(`too small: ${e.value}`)
	)
) // wrap me with catchTag

check(
	'catchTag recovers by tag',
	Effect.runSync(recovered),
	'too small: -3'
)
