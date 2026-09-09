import { check, section } from '../../lib/check'
section(
	'yield* delegates to another generator -- the same yield* Effect uses.'
)

/*
 * Before you start:
 * - Mental model: `yield*` lets one generator hand control to another iterable.
 *   The outer generator emits every value from the inner one before continuing.
 * - Shape to look for: one local yield, one delegated sequence, then one final
 *   local yield.
 * - Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*
 */

function* inner(): Generator<number> {
	yield 1
	yield 2
}

// 📝 TODO: yield 0, then delegate to inner() with yield*, then yield 3.
function* outer(): Generator<number> {
	yield -1 // fix me
}

// ---- checks (don't edit) ----
check('yield* flattens delegated yields', [...outer()], [0, 1, 2, 3])
