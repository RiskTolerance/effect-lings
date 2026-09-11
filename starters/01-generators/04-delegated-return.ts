import { check, section } from '../../lib/check'
section('yield* also gives you the inner generator’s return value.')

// A delegated generator can yield requests AND return a final answer.
// The outer generator forwards the yields; its yield* expression evaluates
// to the inner return value. That return is not another yielded value.
// This is the pattern behind const answer = yield* someEffect later.

function* inner(): Generator<string, number, number> {
	const answer = yield 'give me a number'
	return answer + 1
}

// 📝 TODO: capture yield* inner() in a variable, then return it times 10.
function* outer(): Generator<string, number, number> {
	yield 'TODO'
	return 0
}

// ---- checks (don't edit) ----
const iterator = outer()
const request = iterator.next()
check(
	'the inner request is forwarded',
	request.value,
	'give me a number'
)
check('the request is a yield', request.done, false)
const final = iterator.next(4) // Travels through outer to the yield in inner.
check('outer uses the inner return value of 5', final.value, 50)
check('the inner return was not yielded', final.done, true)
