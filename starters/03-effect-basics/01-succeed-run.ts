import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section(
	'Effect<A,E,R> is a *description*. Nothing runs until you run it.'
)

/*
 * Before you start:
 * - Mental model: `Effect<A, E, R>` describes work that can succeed with `A`,
 *   fail with expected error `E`, and require services `R`. It is a value, not
 *   the result itself.
 * - Shape to look for: build a success description with `Effect.succeed`, then
 *   run it at the edge with `Effect.runSync`.
 * - Docs: v4 API reference:
 *   https://effect-ts.github.io/effect/effect/Effect.ts.html
 *   Concept docs: https://effect.website/docs/getting-started/the-effect-type
 */

// 📝 TODO: create an Effect that succeeds with 42 (Effect.succeed),
//          then execute it with Effect.runSync and store the result.
const program = Effect.succeed(0) // fix me
const value = 0 // fix me

// ---- checks (don't edit) ----
check('runSync of succeed(42)', value, 42)
check(
	'succeed creates an Effect description',
	typeof program === 'object',
	true
)

// `succeed(value)` stores an already-computed value. JavaScript still evaluates
// arguments immediately: Effect.succeed(console.log('hi')) logs at construction.
// Use Effect.sync(() => ...) to defer actual work (09-sync.ts).
