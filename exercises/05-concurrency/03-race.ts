import { Duration, Effect } from "effect";
import { check, section } from "../../lib/check";
section("race runs two Effects at once; the first to finish wins and the loser is interrupted.");

// Before you start:
// - Mental model: `race` starts both effects, completes with the first result,
//   and interrupts the loser so it does not keep running useless work.
// - Shape to look for: combine `fast` and `slow` into one Effect whose success
//   value is whichever finishes first.
// - Docs: v4 API reference:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   Concept docs: https://effect.website/docs/concurrency/basic-concurrency

const fast = Effect.succeed("fast");
const slow = Effect.succeed("slow").pipe(Effect.delay(Duration.millis(50)));

// 📝 TODO: race `fast` against `slow` with Effect.race so the winner is "fast".
const program: Effect.Effect<string> = Effect.succeed(""); // fix me

// ---- checks (don't edit) ----
check("race yields the faster Effect's result", await Effect.runPromise(program), "fast");
