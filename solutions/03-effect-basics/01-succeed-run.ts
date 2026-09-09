import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section(
	'Effect<A,E,R> is a *description* of a computation. Nothing runs until you run it.'
)

const program = Effect.succeed(42) // a value lifted into Effect
const value = Effect.runSync(program) // execute it

check('runSync of succeed(42)', value, 42)
check(
	'succeed creates an Effect description',
	typeof program === 'object',
	true
)

// `succeed(value)` stores an already-computed value. JavaScript still evaluates
// arguments immediately: Effect.succeed(console.log('hi')) logs at construction.
// Use Effect.sync(() => ...) to defer actual work (exercise 05).
