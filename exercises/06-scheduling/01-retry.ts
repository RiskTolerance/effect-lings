import { Effect, Ref, Schedule } from "effect";
import { check, section } from "../../lib/check";
section("retry re-runs a FAILING Effect according to a Schedule. Schedule.recurs(n) allows up to n retries.");

const program = Effect.gen(function* () {
  const attempts = yield* Ref.make(0);

  // A flaky Effect: it fails the first two times, then succeeds on the third,
  // returning the attempt number.
  const flaky = Effect.gen(function* () {
    const n = yield* Ref.updateAndGet(attempts, (x) => x + 1);
    if (n < 3) return yield* Effect.fail("not ready");
    return n;
  });

  // 📝 TODO: retry `flaky` with Schedule.recurs(5) and return the result.
  //          const result = yield* Effect.retry(flaky, Schedule.recurs(5))
  const result = yield* flaky.pipe(Effect.orElseSucceed(() => -1)); // fix me
  return result;
});

// ---- checks (don't edit) ----
check("retry keeps re-running until the Effect succeeds", await Effect.runPromise(program), 3);
