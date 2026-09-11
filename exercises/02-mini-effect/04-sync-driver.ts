import { check, section } from '../../lib/check'
section('A driver repeats the steps you just did by hand.')

// While done is false, value is a request. Execute it and resume.
// When done is true, value is the final answer. Return it.
// This loop lets us run a program with any number of requests.
type Op = { run: () => number }
const sync = (run: () => number): Op => ({ run })

function run(program: () => Generator<Op, number, number>): number {
	const iterator = program()
	let step = iterator.next()
	while (!step.done) {
		// 📝 TODO: execute step.value.run(), then update step by resuming.
		throw new Error('TODO: implement the sync driver')
	}
	return step.value
}

// ---- checks (don't edit) ----
function* program(): Generator<Op, number, number> {
	const a = yield sync(() => 2)
	const b = yield sync(() => a + 3)
	const c = yield sync(() => b * 10)
	return c
}
check('driver handles repeated requests', run(program), 50)
check(
	'a program can return without yielding',
	run(function* () {
		return 7
	}),
	7
)
