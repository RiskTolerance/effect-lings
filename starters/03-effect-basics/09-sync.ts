import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section('sync delays a callback until the Effect runs.')

// Effect.succeed(value) stores a value JavaScript has already computed.
// Effect.sync(callback) stores work to perform later, like your mini driver.
// The callback runs again each time you run the Effect.

let calls = 0

// 📝 TODO: use Effect.sync to increment calls and return its new value.
const tick: Effect.Effect<number> = Effect.succeed(0)

// ---- checks (don't edit) ----
check('construction does not run the callback', calls, 0)
check('first run executes the callback', Effect.runSync(tick), 1)
check('second run executes it again', Effect.runSync(tick), 2)
check('the callback ran exactly twice', calls, 2)
