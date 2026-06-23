import { Effect, Ref } from "effect";
import { check, section } from "../../lib/check";
section("Mutable state, the Effect way: a Ref is a typed, fiber-safe cell you read and update with Effects.");

// Before you start:
// - Mental model: `Ref` is mutable state described and accessed through Effects.
//   Reads and updates are effects too, so they compose with `Effect.gen` and
//   stay safe across fibers.
// - Shape to look for: create the Ref inside the program, yield updates in
//   order, then yield a final read. `modify` returns one value while storing
//   another.
// - Docs: v4 API references:
//   https://effect-ts.github.io/effect/effect/Ref.ts.html#make
//   https://effect-ts.github.io/effect/effect/Ref.ts.html#modify
//   Concept docs: https://effect.website/docs/state-management/ref/#using-ref

// 📝 TODO: build a program that:
//          1. creates a Ref starting at 0        (Ref.make)
//          2. updates it three times: +1, +1, +5 (Ref.update)
//          3. returns the final value            (Ref.get)
const program: Effect.Effect<number> = Effect.succeed(0); // fix me

// 📝 TODO: use Ref.modify to atomically read-and-set in one step: return the
//          OLD value while bumping the cell by 10. Start the Ref at 100.
const drawThenAdd: Effect.Effect<number> = Effect.succeed(0); // fix me

// ---- checks (don't edit) ----
check("update threads state through the program", Effect.runSync(program), 7);
check("modify returns the old value while updating the cell", Effect.runSync(drawThenAdd), 100);
