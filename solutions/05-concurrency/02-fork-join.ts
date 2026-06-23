import { Effect, Fiber } from "effect";
import { check, section } from "../../lib/check";
section("fork starts an Effect on its own fiber — it runs concurrently. Fiber.join awaits that fiber's result.");

// forkChild returns immediately with a Fiber handle; the work proceeds on its
// own fiber. Fiber.join suspends the current fiber until that one produces a
// value. Both forks are in flight before either join.
const program = Effect.gen(function* () {
  const f1 = yield* Effect.forkChild(Effect.succeed(20));
  const f2 = yield* Effect.forkChild(Effect.succeed(22));
  return (yield* Fiber.join(f1)) + (yield* Fiber.join(f2));
});

// ---- checks (don't edit) ----
check("two forked fibers run, then join back to their results", await Effect.runPromise(program), 42);
