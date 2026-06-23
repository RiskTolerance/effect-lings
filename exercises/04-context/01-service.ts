import { Context, Effect, Layer } from "effect";
import { check, section } from "../../lib/check";
section("A service is an interface stored in the context (the R channel). Yield it to pull the implementation out.");

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
