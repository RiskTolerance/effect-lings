import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section('map transforms an Effect’s success value.')

// Effect.map(program, callback) builds a new Effect.
// The callback receives the success value and returns a plain value.
// We keep describing work here; the checks run it.

const name = Effect.succeed('Ada')

const upperName = Effect.map(name, (value) => value.toUpperCase())

// ---- checks (don't edit) ----
check(
	'the new Effect produces the uppercase name',
	Effect.runSync(upperName),
	'ADA'
)
check('the original Effect is unchanged', Effect.runSync(name), 'Ada')
