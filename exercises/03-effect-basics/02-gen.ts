import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section(
	'Effect.gen uses the same generator mechanics as your driver. yield* binds an Effect result.'
)

/*
 * Before you start:
 * - Mental model: `Effect.gen` uses the generator mechanics you just built on. `yield*` waits for an Effect and gives you its success value.
 * - Shape to look for: bind one Effect result, use it to build the next Effect,
 *   then return a plain final value from the generator.
 * - Docs: v4 API reference:
 *   https://effect-ts.github.io/effect/effect/Effect.ts.html
 *   Concept docs: https://effect.website/docs/getting-started/using-generators
 */

const add = (a: number, b: number) => Effect.succeed(a + b)

// 📝 TODO: inside the gen, yield* Effect.succeed(10) into x,
//          yield* add(x, 5) into y, and return y * 2.
const program = Effect.gen(function* () {
	const x = yield* Effect.succeed(10)
	const y = yield* add(x, 5)
	return y * 2
})

// ---- checks (don't edit) ----
check(
	'gen threads results just like your driver',
	Effect.runSync(program),
	30
)
