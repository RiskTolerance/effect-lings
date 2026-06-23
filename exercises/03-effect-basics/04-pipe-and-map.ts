import { Effect } from "effect"
import { check, section } from "../../lib/check"
section("Transform Effects without running them: .pipe + map (plain values) and flatMap (Effect-returning).")

// Before you start:
// - Mental model: `map` changes a successful plain value inside an Effect.
//   `flatMap` is for a callback that returns another Effect, so the result is
//   flattened instead of becoming an Effect inside an Effect.
// - Shape to look for: keep building descriptions; do not run them until the
//   checks.
// - Docs: v4 API references:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html#map
//   https://effect-ts.github.io/effect/effect/Effect.ts.html#flatmap
//   Concept docs: https://effect.website/docs/getting-started/building-pipelines/#map

const fetchUser = Effect.succeed({ name: "Ada", age: 36 })
const lookupAge = (name: string) => Effect.succeed(name === "Ada" ? 36 : 0)

// 📝 TODO: use fetchUser.pipe(Effect.map(...)) to derive an Effect<string>
//          that is the user's name, uppercased. Don't run it here.
const upperName: Effect.Effect<string> = Effect.map(fetchUser, (user) => user.name.toUpperCase()) // pretty sure this is simpler than using pipe, since it's just one operation?

// 📝 TODO: starting from fetchUser, use Effect.flatMap to call lookupAge with
//          the user's name (it returns an Effect), then Effect.map to add 1.
const agePlusOne: Effect.Effect<number> = fetchUser.pipe(Effect.flatMap((user) => lookupAge(user.name)), Effect.map((age) => age + 1))

// ---- checks (don't edit) ----
check("map transforms the success value", Effect.runSync(upperName), "ADA")
check("flatMap chains an Effect-returning step, then map adds 1", Effect.runSync(agePlusOne), 37)
