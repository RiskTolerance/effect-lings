import { Context, Effect } from 'effect'
import { check, section } from '../../lib/check'
section('Request a service that the caller supplies.')

// A service is an object your program needs, such as a greeting function.
// Greeter is the key used to look that object up. yield* Greeter retrieves it.
// The checks supply the implementation for you; focus on using it.
// Supplying different implementations lets the same program behave differently.

// This supplied declaration names the service and describes its methods.
class Greeter extends Context.Service<
	Greeter,
	{ readonly greet: (name: string) => string }
>()('Greeter') {}

const program = Effect.gen(function* () {
	const greeter = yield* Greeter
	return greeter.greet('Ada')
})

// ---- checks (don't edit) ----
check(
	'program reads the supplied service',
	Effect.runSync(
		Effect.provideService(program, Greeter, {
			greet: (name) => `Hello, ${name}!`
		})
	),
	'Hello, Ada!'
)
check(
	'the same program can use another implementation',
	Effect.runSync(
		Effect.provideService(program, Greeter, {
			greet: (name) => `Hi, ${name}!`
		})
	),
	'Hi, Ada!'
)
