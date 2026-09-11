import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section('A plain fallback value has a shorter recovery form.')

// You used catch(() => Effect.succeed(0)) to recover to zero.
// Effect.orElseSucceed(() => 0) expresses the same fallback.
// Its callback returns a plain value. Successes are left unchanged.

const positive = (n: number): Effect.Effect<number, string> =>
	n > 0 ? Effect.succeed(n) : Effect.fail('not positive')

// 📝 TODO: recover positive(n) with orElseSucceed and a fallback of 0.
const safe = (n: number): Effect.Effect<number> => Effect.succeed(-1)

// ---- checks (don't edit) ----
check('failure uses the fallback', Effect.runSync(safe(-2)), 0)
check('success skips the fallback', Effect.runSync(safe(7)), 7)
