import { Context, Effect, Layer, Ref } from "effect";
import { check, section } from "../../lib/check";
section("Layer.succeed wraps a ready value; Layer.effect BUILDS the service from an Effect — so it can allocate state.");

class Counter extends Context.Service<
  Counter,
  { readonly next: () => Effect.Effect<number> }
>()("Counter") {}

// 📝 TODO: build CounterLive with Layer.effect(Counter)(Effect.gen(...)). In the
//          construction: allocate `const ref = yield* Ref.make(0)`, then return
//          Counter.of({ next: () => Ref.updateAndGet(ref, (n) => n + 1) }).
//          Because the Ref is created ONCE when the layer is built, all callers
//          share it.
const CounterLive: Layer.Layer<Counter> = Layer.succeed(Counter)(
  Counter.of({ next: () => Effect.succeed(0) }), // fix me: stateless, always 0
);

const program = Effect.gen(function* () {
  const counter = yield* Counter;
  return [yield* counter.next(), yield* counter.next(), yield* counter.next()];
});

// ---- checks (don't edit) ----
check(
  "each next() advances the state held inside the layer",
  Effect.runSync(program.pipe(Effect.provide(CounterLive))),
  [1, 2, 3],
);
