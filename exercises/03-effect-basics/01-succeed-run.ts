import { Effect } from "effect"
import { check, section } from "../../lib/check"
section("Effect<A,E,R> is a *description*. Nothing runs until you run it.")

// Before you start:
// - Mental model: `Effect<A, E, R>` describes work that can succeed with `A`,
//   fail with expected error `E`, and require services `R`. It is a value, not
//   the result itself.
// - Shape to look for: build a success description with `Effect.succeed`, then
//   run it at the edge with `Effect.runSync`.
// - Docs: v4 API reference:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   Concept docs: https://effect.website/docs/getting-started/the-effect-type

// 📝 TODO: create an Effect that succeeds with 42 (Effect.succeed),
//          then execute it with Effect.runSync and store the result.
const program = Effect.succeed(42)
const value = Effect.runSync(program)

// ---- checks (don't edit) ----
check("runSync of succeed(42)", value, 42)
check("succeed is lazy: it's an object, not the value", typeof program === "object", true)
