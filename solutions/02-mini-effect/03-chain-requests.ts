import { check, section } from '../../lib/check'
section('The second request uses the first answer.')

// .next(result) both answers the previous yield and advances to the next.
// Save that new step: it contains either another request or the final answer.
type Op = { run: () => number }
const sync = (run: () => number): Op => ({ run })

function* program(): Generator<Op, number, number> {
	const a = yield sync(() => 2)
	const b = yield sync(() => a + 3)
	return b * 10
}

function runTwo(): IteratorResult<Op, number> {
	const iterator = program()
	const first = iterator.next()
	if (first.done) throw new Error('Expected the first request')
	const second = iterator.next(first.value.run()) // a becomes 2.
	if (second.done) throw new Error('Expected the second request')

	// Return the resulting step. What number will b receive?
	const result = second.value.run()
	return iterator.next(result)
}

// ---- checks (don't edit) ----
const final = runTwo()
check('both requests finished', final.done, true)
check('the second request used the first answer', final.value, 50)
