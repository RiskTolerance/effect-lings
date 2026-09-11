import { check, section } from '../../lib/check'
section('Run one request, then send its answer back.')

// Calling function* creates an iterator: a paused execution with .next().
// yield sends a request OUT; .next(answer) sends its answer IN.
// Running the request alone does not resume the program.
type Op = { run: () => number }

// Generator<what goes OUT, final return type, what comes IN>
function* program(): Generator<Op, number, number> {
	const answer = yield { run: () => 2 }
	return answer * 10
}

function runOne(): IteratorResult<Op, number> {
	const iterator = program() // The body has not started yet.
	const step = iterator.next() // Advance to the yield.
	if (step.done) throw new Error('Expected a work request')

	// 📝 TODO: run step.value.run(), then return iterator.next(result).
	throw new Error('TODO: implement runOne')
}

// ---- checks (don't edit) ----
const final = runOne()
check('the program returned', final.done, true)
check('the answer came back into the yield', final.value, 20)
