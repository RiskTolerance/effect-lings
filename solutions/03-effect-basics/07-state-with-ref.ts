import { Effect, Ref } from "effect";
import { check, section } from "../../lib/check";
section("Mutable state, the Effect way: a Ref is a typed, fiber-safe cell you read and update with Effects.");

const program: Effect.Effect<number> = Effect.gen(function* () {
  const ref = yield* Ref.make(0);
  yield* Ref.update(ref, (n) => n + 1);
  yield* Ref.update(ref, (n) => n + 1);
  yield* Ref.update(ref, (n) => n + 5);
  return yield* Ref.get(ref);
});

// modify computes [returnValue, newState] in one atomic step — the building
// block the other Ref helpers are written in terms of.
const drawThenAdd: Effect.Effect<number> = Effect.gen(function* () {
  const ref = yield* Ref.make(100);
  return yield* Ref.modify(ref, (n) => [n, n + 10]);
});

// ---- checks (don't edit) ----
check("update threads state through the program", Effect.runSync(program), 7);
check("modify returns the old value while updating the cell", Effect.runSync(drawThenAdd), 100);
