import { check, section } from '../../lib/check'
section(
	'Generators are pausable functions. `function*` returns an iterator.'
)

function* count(): Generator<number> {
	yield 1
	yield 2
	yield 3
}

const it = count()
check('first next().value', it.next().value, 1)
check('second next().value', it.next().value, 2)
check('third next().value', it.next().value, 3)
check('fourth next().done', it.next().done, true)
check('spreading collects all yields', [...count()], [1, 2, 3])
