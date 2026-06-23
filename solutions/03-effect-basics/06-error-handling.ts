import { Effect, Result } from "effect";
import { check, section } from "../../lib/check";
section("Four ways to deal with the E channel: recover, fall back, match both sides, or capture as a value.");

const risky = (n: number): Effect.Effect<number, string> =>
  n < 0 ? Effect.fail("negative") : Effect.succeed(n);

// orElseSucceed: the quickest recovery when the fallback is a plain value.
// (Effect.catch((e) => Effect.succeed(0)) would be the Effect-returning form.)
const safe = (n: number): Effect.Effect<number> =>
  risky(n).pipe(Effect.orElseSucceed(() => 0));

// match: handle both channels at once, producing a single value that can't fail.
const described = (n: number): Effect.Effect<string> =>
  risky(n).pipe(
    Effect.match({
      onFailure: (e) => `error: ${e}`,
      onSuccess: (a) => `ok: ${a}`,
    }),
  );

// result: move the failure out of the E channel and into the value as a
// Result<A, E>. Useful when you want to inspect success-vs-failure as data.
const captured = (n: number): Effect.Effect<Result.Result<number, string>> =>
  Effect.result(risky(n));

// ---- checks (don't edit) ----
check("catch/orElse recovers a failure to the default", Effect.runSync(safe(-5)), 0);
check("catch/orElse leaves a success untouched", Effect.runSync(safe(7)), 7);
check("match collapses the failure side", Effect.runSync(described(-1)), "error: negative");
check("match collapses the success side", Effect.runSync(described(3)), "ok: 3");
const r = Effect.runSync(captured(-2));
check("result captures failure as a value (no throw)", Result.isFailure(r), true);
check("the captured Result holds the error", Result.isFailure(r) ? r.failure : null, "negative");
