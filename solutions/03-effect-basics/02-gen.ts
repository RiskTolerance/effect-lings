import { Effect } from "effect";
import { check, section } from "../../lib/check";
section("Effect.gen IS the driver you built. yield* pulls a value out of an Effect.");

const add = (a: number, b: number) => Effect.succeed(a + b);

const program = Effect.gen(function* () {
  const x = yield* Effect.succeed(10);
  const y = yield* add(x, 5);
  return y * 2;
});

check("gen threads results just like your driver", Effect.runSync(program), 30);
