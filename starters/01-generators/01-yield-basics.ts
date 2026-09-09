import { check, section } from '../../lib/check'
section(
	'Generators are pausable functions. `function*` returns an iterator.'
)

/*
 * Before you start:
 * - Mental model: calling a generator function does not run its body right away.
 *   It gives you an iterator. Each `.next()` runs until the next `yield`.
 * - Shape to look for: three pauses that emit 1, 2, and 3. When the function
 *   reaches the end, the next result has `done: true`.
 * - Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
 */

// 📝 TODO: make this generator yield 1, then 2, then 3.
function* count(): Generator<number> {
	yield 0 // fix me
}

// ---- checks (don't edit) ----
const it = count()
check('first next().value', it.next().value, 1)
check('second next().value', it.next().value, 2)
check('third next().value', it.next().value, 3)
check('fourth next().done', it.next().done, true)
check('spreading collects all yields', [...count()], [1, 2, 3])
