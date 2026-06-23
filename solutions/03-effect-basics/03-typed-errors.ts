import { Effect, Data } from "effect";
import { check, section } from "../../lib/check";
section("The E channel: errors live in the type. Data.TaggedError gives you typed, matchable failures.");

class TooSmall extends Data.TaggedError("TooSmall")<{ value: number }> {}

// The explicit return type matters: a `cond ? succeed : fail` expression infers
// a *union* of two Effects, and Effect v4's combinators want one unified
// `Effect<A, E, R>`. Annotating collapses it so the E channel reads `TooSmall`.
const ensurePositive = (n: number): Effect.Effect<number, TooSmall> =>
  n > 0 ? Effect.succeed(n) : Effect.fail(new TooSmall({ value: n }));

check("happy path returns the value", Effect.runSync(ensurePositive(5)), 5);

const recovered = ensurePositive(-3).pipe(
  Effect.catchTag("TooSmall", (e) => Effect.succeed(`too small: ${e.value}`))
);
check("catchTag recovers by tag", Effect.runSync(recovered), "too small: -3");
