import { Effect } from "effect";
import { check, section } from "../../lib/check";
section("Effect.gen IS the driver you built. yield* pulls a value out of an Effect.");

const add = (a: number, b: number) => Effect.succeed(a + b);

// 📝 TODO: inside the gen, yield* Effect.succeed(10) into x,
//          yield* add(x, 5) into y, and return y * 2.
const program = Effect.gen(function* () {
  // your code here
  return 0;
});

// ---- checks (don't edit) ----
check("gen threads results just like your driver", Effect.runSync(program), 30);
