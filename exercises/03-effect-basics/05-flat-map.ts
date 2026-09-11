import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section('flatMap chains a callback that returns an Effect.')

// map is for a callback returning a plain value.
// Here lookupAge returns another Effect, so use flatMap to get its result.
// This expresses the same dependency as two yield* steps in Effect.gen.

const name = Effect.succeed('Ada')
const lookupAge = (name: string) =>
	Effect.succeed(name === 'Ada' ? 36 : 0)

// 📝 TODO: use name.pipe(Effect.flatMap(...)) to call lookupAge.
const age: Effect.Effect<number> = Effect.succeed(0)

// ---- checks (don't edit) ----
check(
	'one run produces the age, not another Effect',
	Effect.runSync(age),
	36
)
