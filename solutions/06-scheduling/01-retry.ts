import { Effect, Ref, Schedule } from "effect";
import { check, section } from "../../lib/check";
section("retry re-runs a FAILING Effect according to a Schedule. Schedule.recurs(n) allows up to n retries.");

const program = Effect.gen(function* () {
  const attempts = yield* Ref.make(0);

  const flaky = Effect.gen(function* () {
    const n = yield* Ref.updateAndGet(attempts, (x) => x + 1);
    if (n < 3) return yield* Effect.fail("not ready");
    return n;
  });

  // recurs(5) permits up to 5 retries. The 3rd run succeeds, so retry stops
  // there and yields its value. (A failing schedule would surface the last error.)
  const result = yield* Effect.retry(flaky, Schedule.recurs(5));
  return result;
});

// ---- checks (don't edit) ----
check("retry keeps re-running until the Effect succeeds", await Effect.runPromise(program), 3);
