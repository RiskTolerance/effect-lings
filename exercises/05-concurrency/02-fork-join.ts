import { Effect, Fiber } from "effect";
import { check, section } from "../../lib/check";
section("fork starts an Effect on its own fiber — it runs concurrently. Fiber.join awaits that fiber's result.");

// 📝 TODO: in the gen, fork BOTH effects with Effect.forkChild to get two fibers
//          running concurrently, then Fiber.join each and return their sum (42).
//          const f1 = yield* Effect.forkChild(Effect.succeed(20))
//          const f2 = yield* Effect.forkChild(Effect.succeed(22))
//          return (yield* Fiber.join(f1)) + (yield* Fiber.join(f2))
const program = Effect.gen(function* () {
  return 0; // fix me
});

// ---- checks (don't edit) ----
check("two forked fibers run, then join back to their results", await Effect.runPromise(program), 42);
