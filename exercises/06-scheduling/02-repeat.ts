import { Effect, Ref, Schedule } from "effect";
import { check, section } from "../../lib/check";
section("repeat re-runs a SUCCEEDING Effect according to a Schedule. recurs(n) repeats n more times (n+1 runs total).");

// Before you start:
// - Mental model: `repeat` is for successes. The first run happens once, then
//   the Schedule decides how many successful repetitions follow.
// - Shape to look for: `Schedule.recurs(3)` means three repeats after the first
//   run, so the effect runs four times total.
// - Docs: v4 API references:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   https://effect-ts.github.io/effect/effect/Schedule.ts.html
//   Concept docs: https://effect.website/docs/scheduling/repetition

const program = Effect.gen(function* () {
  const count = yield* Ref.make(0);
  const bump = Ref.update(count, (n) => n + 1);

  // 📝 TODO: repeat `bump` with Schedule.recurs(3) so it runs 4 times in total
  //          (1 initial run + 3 repeats). Then the final count below reads 4.
  //          yield* Effect.repeat(bump, Schedule.recurs(3))

  return yield* Ref.get(count);
});

// ---- checks (don't edit) ----
check("repeat runs the effect n+1 times (1 initial + 3 repeats)", await Effect.runPromise(program), 4);
