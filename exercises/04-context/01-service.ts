import { Context, Effect, Layer } from "effect";
import { check, section } from "../../lib/check";
section("A service is an interface stored in the context (the R channel). Yield it to pull the implementation out.");

// Before you start:
// - Mental model: the `R` channel is a list of services the program needs from
//   its environment. A service tag is the key used to request an implementation.
// - Shape to look for: `yield* Greeter` adds a Greeter requirement; providing
//   `GreeterLive` removes that requirement before running.
// - Docs: v4 API references:
//   https://effect-ts.github.io/effect/effect/Context.ts.html
//   https://effect-ts.github.io/effect/effect/Layer.ts.html
//   Concept docs: https://effect.website/docs/requirements-management/services

// The service KEY: an identity + the shape of its implementation. Yielding it
// inside a gen retrieves whatever implementation the context provides.
class Greeter extends Context.Service<
  Greeter,
  { readonly greet: (name: string) => string }
>()("Greeter") {}

// A concrete implementation, provided as a Layer.
const GreeterLive = Layer.succeed(Greeter)(
  Greeter.of({ greet: (name) => `Hello, ${name}!` }),
);

// 📝 TODO: inside the gen, `const greeter = yield* Greeter` to get the service,
//          then `return greeter.greet("world")`.
const program = Effect.gen(function* () {
  return ""; // fix me
});

// 📝 TODO: provide GreeterLive so the program's requirement is satisfied.
//          Hint: program.pipe(Effect.provide(GreeterLive)).
//          (Until you do, adding the yield* above turns this into a type error —
//           that's the R channel telling you a dependency is unmet.)
const runnable: Effect.Effect<string> = program; // fix me

// ---- checks (don't edit) ----
check("yielding the service calls its method", Effect.runSync(runnable), "Hello, world!");
