import { Context, Effect, Layer } from "effect";
import { check, section } from "../../lib/check";
section("Layers depend on layers. A layer that REQUIRES another service is wired up with Layer.provide.");

class Config extends Context.Service<Config, { readonly greeting: string }>()("Config") {}
class Greeter extends Context.Service<
  Greeter,
  { readonly greet: (name: string) => Effect.Effect<string> }
>()("Greeter") {}

const ConfigLive = Layer.succeed(Config)(Config.of({ greeting: "Hi" }));

// Yielding Config in the construction makes Config a requirement OF THE LAYER.
// Its type is now Layer<Greeter, never, Config>.
const GreeterLive = Layer.effect(Greeter)(
  Effect.gen(function* () {
    const config = yield* Config;
    return Greeter.of({
      greet: (name) => Effect.succeed(`${config.greeting}, ${name}!`),
    });
  }),
);

const program = Effect.gen(function* () {
  const greeter = yield* Greeter;
  return yield* greeter.greet("Ada");
});

// Layer.provide(GreeterLive, ConfigLive) satisfies GreeterLive's need for Config,
// producing a self-contained Layer<Greeter> with no remaining requirements.
const runnable: Effect.Effect<string> = program.pipe(
  Effect.provide(Layer.provide(GreeterLive, ConfigLive)),
);

// ---- checks (don't edit) ----
check("the greeter reads its dependency from the context", Effect.runSync(runnable), "Hi, Ada!");
