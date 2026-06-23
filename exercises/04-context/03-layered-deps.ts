import { Context, Effect, Layer } from "effect";
import { check, section } from "../../lib/check";
section("Layers depend on layers. A layer that REQUIRES another service is wired up with Layer.provide.");

class Config extends Context.Service<Config, { readonly greeting: string }>()("Config") {}
class Greeter extends Context.Service<
  Greeter,
  { readonly greet: (name: string) => Effect.Effect<string> }
>()("Greeter") {}

const ConfigLive = Layer.succeed(Config)(Config.of({ greeting: "Hi" }));

// 📝 TODO: in GreeterLive's construction, `yield* Config` and use config.greeting
//          to format the greeting, e.g. `${config.greeting}, ${name}!`.
//          Doing so changes GreeterLive's type to Layer<Greeter, never, Config>:
//          it now REQUIRES a Config to be built.
const GreeterLive = Layer.effect(Greeter)(
  Effect.gen(function* () {
    return Greeter.of({ greet: (name) => Effect.succeed(name) }); // fix me
  }),
);

const program = Effect.gen(function* () {
  const greeter = yield* Greeter;
  return yield* greeter.greet("Ada");
});

// 📝 TODO: once GreeterLive requires Config, providing it alone won't type-check.
//          Feed ConfigLive into it first: Layer.provide(GreeterLive, ConfigLive)
//          yields a Layer<Greeter> that needs nothing. Provide THAT.
const runnable: Effect.Effect<string> = program.pipe(Effect.provide(GreeterLive)); // fix me

// ---- checks (don't edit) ----
check("the greeter reads its dependency from the context", Effect.runSync(runnable), "Hi, Ada!");
