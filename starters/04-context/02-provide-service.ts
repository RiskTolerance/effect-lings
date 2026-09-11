import { Context, Effect } from 'effect'
import { check, section } from '../../lib/check'
section('Supply the implementation a program needs.')

// Effect.Effect<string, never, Greeter> means: returns a string, has no
// expected errors, and needs Greeter. The third type parameter is called R.
// Effect.provideService(program, Greeter, implementation) satisfies that need.
// The result can run because its R channel no longer requires Greeter.

// This supplied declaration names the service and describes its methods.
class Greeter extends Context.Service<
	Greeter,
	{ readonly greet: (name: string) => string }
>()('Greeter') {}

const program = Effect.gen(function* () {
	const greeter = yield* Greeter
	return greeter.greet('Ada')
})

const implementation = { greet: (name: string) => `Hello, ${name}!` }

// 📝 TODO: provide implementation to program with Effect.provideService.
const runnable: Effect.Effect<string> = Effect.succeed('')

// ---- checks (don't edit) ----
check(
	'the supplied program can run',
	Effect.runSync(runnable),
	'Hello, Ada!'
)
