import { Duration, Effect } from "effect";
import { check, section } from "../../lib/check";
section("race runs two Effects at once; the first to finish wins and the loser is interrupted.");

const fast = Effect.succeed("fast");
const slow = Effect.succeed("slow").pipe(Effect.delay(Duration.millis(50)));

// 📝 TODO: race `fast` against `slow` with Effect.race so the winner is "fast".
const program: Effect.Effect<string> = Effect.succeed(""); // fix me

// ---- checks (don't edit) ----
check("race yields the faster Effect's result", await Effect.runPromise(program), "fast");
