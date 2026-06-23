import { Effect } from "effect"
import { check, section } from "../../lib/check"
section("Effect.gen IS the driver you built. yield* pulls a value out of an Effect.")

// Before you start:
// - Mental model: `Effect.gen` is the production version of the driver you just
//   built. `yield*` waits for an Effect and gives you its success value.
// - Shape to look for: bind one Effect result, use it to build the next Effect,
//   then return a plain final value from the generator.
// - Docs: v4 API reference:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   Concept docs: https://effect.website/docs/getting-started/using-generators

const add = (a: number, b: number) => Effect.succeed(a + b)

// 📝 TODO: inside the gen, yield* Effect.succeed(10) into x,
//          yield* add(x, 5) into y, and return y * 2.
const program = Effect.gen(function* () {
  let x = Effect.succeed(10)
  let y = yield* add(yield* x, 5)
  return y * 2
})

// ---- checks (don't edit) ----
check("gen threads results just like your driver", Effect.runSync(program), 30)
