import { Duration, Effect } from "effect";
import { check, section } from "../../lib/check";
section("race runs two Effects at once; the first to finish wins and the loser is interrupted.");

const fast = Effect.succeed("fast");
const slow = Effect.succeed("slow").pipe(Effect.delay(Duration.millis(50)));

// race returns the first to complete. `slow` is delayed 50ms, so `fast` wins and
// the still-pending `slow` fiber is interrupted.
const program: Effect.Effect<string> = Effect.race(fast, slow);

// ---- checks (don't edit) ----
check("race yields the faster Effect's result", await Effect.runPromise(program), "fast");
