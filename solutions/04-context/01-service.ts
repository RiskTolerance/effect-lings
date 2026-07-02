import { Context, Effect, Layer } from 'effect'
import { check, section } from '../../lib/check'
section(
	'A service is an interface stored in the context (the R channel). Yield it to pull the implementation out.'
)

class Greeter extends Context.Service<
	Greeter,
	{ readonly greet: (name: string) => string }
>()('Greeter') {}

const GreeterLive = Layer.succeed(Greeter)(
	Greeter.of({ greet: (name) => `Hello, ${name}!` })
)

// Yielding the key adds `Greeter` to the program's R channel — "this needs a
// Greeter to run." The type is Effect<string, never, Greeter>.
const program = Effect.gen(function* () {
	const greeter = yield* Greeter
	return greeter.greet('world')
})

// Providing the layer discharges the requirement: R goes from Greeter to never,
// so the program can be run.
const runnable: Effect.Effect<string> = program.pipe(
	Effect.provide(GreeterLive)
)

// ---- checks (don't edit) ----
check(
	'yielding the service calls its method',
	Effect.runSync(runnable),
	'Hello, world!'
)
