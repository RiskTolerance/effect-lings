import { Effect } from "effect";
import { check, section } from "../../lib/check";
section("Effect.all runs a collection of Effects and gathers their results — sequentially, or concurrently via an option.");

// Before you start:
// - Mental model: `Effect.all` combines many Effect descriptions into one
//   description. It controls execution strategy, but the collected result keeps
//   the same order as the input collection.
// - Shape to look for: one version with default execution, one version with
//   `{ concurrency: "unbounded" }`.
// - Docs: v4 API reference:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   Concept docs: https://effect.website/docs/concurrency/basic-concurrency

const double = (n: number) => Effect.succeed(n * 2);

// 📝 TODO: Effect.all over the ARRAY [double(1), double(2), double(3)] to get an
//          Effect<number[]> that yields [2, 4, 6].
const results: Effect.Effect<number[]> = Effect.succeed([]); // fix me

// 📝 TODO: the same three effects, but pass { concurrency: "unbounded" } as a
//          second argument so they run at once. Results stay in INPUT order.
const concurrent: Effect.Effect<number[]> = Effect.succeed([]); // fix me

// ---- checks (don't edit) ----
check("all collects results in input order", await Effect.runPromise(results), [2, 4, 6]);
check("the concurrency option does not change result order", await Effect.runPromise(concurrent), [2, 4, 6]);
