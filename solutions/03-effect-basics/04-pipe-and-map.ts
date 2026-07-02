import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section(
	'Transform Effects without running them: .pipe + map (plain values) and flatMap (Effect-returning).'
)

const fetchUser = Effect.succeed({ name: 'Ada', age: 36 })
const lookupAge = (name: string) =>
	Effect.succeed(name === 'Ada' ? 36 : 0)

// map: the function returns a plain value, so Effect wraps it back up for you.
const upperName: Effect.Effect<string> = fetchUser.pipe(
	Effect.map((user) => user.name.toUpperCase())
)

// flatMap: the function itself returns an Effect (lookupAge), so you flatMap to
// avoid an Effect<Effect<...>>. Then a plain map to add 1.
const agePlusOne: Effect.Effect<number> = fetchUser.pipe(
	Effect.flatMap((user) => lookupAge(user.name)),
	Effect.map((age) => age + 1)
)

// ---- checks (don't edit) ----
check(
	'map transforms the success value',
	Effect.runSync(upperName),
	'ADA'
)
check(
	'flatMap chains an Effect-returning step, then map adds 1',
	Effect.runSync(agePlusOne),
	37
)
