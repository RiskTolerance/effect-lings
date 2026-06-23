import { Effect, Data } from "effect";
import { check, section } from "../../lib/check";
section("The E channel: errors live in the type. Data.TaggedError = typed, matchable failures.");

class TooSmall extends Data.TaggedError("TooSmall")<{ value: number }> {}

// 📝 TODO: return Effect.succeed(n) when n > 0, otherwise
//          Effect.fail(new TooSmall({ value: n })).
//          Tip: annotate the return type as `Effect.Effect<number, TooSmall>`
//          so the success/failure branches unify into one Effect.
const ensurePositive = (n: number): Effect.Effect<number, TooSmall> =>
  Effect.succeed(n); // fix me

// ---- checks (don't edit) ----
check("happy path returns the value", Effect.runSync(ensurePositive(5)), 5);

// 📝 TODO: recover from the failure using .pipe(Effect.catchTag("TooSmall", ...))
//          returning `too small: <value>`.
const recovered = ensurePositive(-3); // wrap me with catchTag
check("catchTag recovers by tag", Effect.runSync(recovered), "too small: -3");
