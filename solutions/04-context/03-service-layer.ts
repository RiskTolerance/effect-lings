import { Context, Effect, Layer } from 'effect'
import { check, section } from '../../lib/check'
section('Package a ready service in a Layer.')

// A Layer describes how to provide services. Layer.succeed(Greeter)(object)
// packages an already-built implementation. Effect.provide supplies that layer
// to a program. Greeter.of(object) checks the object's shape; it runs no work.
// The next lesson builds a service with an Effect instead of a ready object.

// This supplied declaration names the service and describes its methods.
class Greeter extends Context.Service<
	Greeter,
	{ readonly greet: (name: string) => string }
>()('Greeter') {}

const program = Effect.gen(function* () {
	const greeter = yield* Greeter
	return greeter.greet('Ada')
})

const implementation = Greeter.of({
	greet: (name) => `Hello, ${name}!`
})

function makeLayer(): Layer.Layer<Greeter> {
	return Layer.succeed(Greeter)(implementation)
}

// ---- checks (don't edit) ----
const runnable = program.pipe(Effect.provide(makeLayer()))
check(
	'the layer provides the greeter',
	Effect.runSync(runnable),
	'Hello, Ada!'
)
