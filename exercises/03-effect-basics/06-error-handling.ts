import { Effect, Result } from "effect";
import { check, section } from "../../lib/check";
section("Four ways to deal with the E channel: recover, fall back, match both sides, or capture as a value.");

const risky = (n: number): Effect.Effect<number, string> =>
  n < 0 ? Effect.fail("negative") : Effect.succeed(n);

// 📝 TODO: recover ANY failure to 0. Use Effect.catch (returns an Effect) or
//          Effect.orElseSucceed (takes a plain fallback value).
//          (risky(n) on its own won't type-check here — its `string` error must
//           be handled before the E channel can be `never`.)
const safe = (n: number): Effect.Effect<number> => Effect.succeed(-1); // fix me

// 📝 TODO: collapse BOTH channels to a string with Effect.match:
//          onFailure -> `error: <e>`, onSuccess -> `ok: <a>`.
const described = (n: number): Effect.Effect<string> => Effect.succeed(""); // fix me

// 📝 TODO: capture the outcome as a value with Effect.result. The resulting
//          Effect cannot fail — its success is a Result<number, string>.
const captured = (n: number): Effect.Effect<Result.Result<number, string>> =>
  Effect.result(Effect.succeed(0)); // fix me

// ---- checks (don't edit) ----
check("catch/orElse recovers a failure to the default", Effect.runSync(safe(-5)), 0);
check("catch/orElse leaves a success untouched", Effect.runSync(safe(7)), 7);
check("match collapses the failure side", Effect.runSync(described(-1)), "error: negative");
check("match collapses the success side", Effect.runSync(described(3)), "ok: 3");
const r = Effect.runSync(captured(-2));
check("result captures failure as a value (no throw)", Result.isFailure(r), true);
check("the captured Result holds the error", Result.isFailure(r) ? r.failure : null, "negative");
