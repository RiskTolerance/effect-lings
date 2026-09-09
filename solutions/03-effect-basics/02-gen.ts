import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section(
	'Effect.gen uses the same generator mechanics as your driver. yield* binds an Effect result.'
)

const add = (a: number, b: number) => Effect.succeed(a + b)

const program = Effect.gen(function* () {
	const x = yield* Effect.succeed(10)
	const y = yield* add(x, 5)
	return y * 2
})

check(
	'gen threads results just like your driver',
	Effect.runSync(program),
	30
)
