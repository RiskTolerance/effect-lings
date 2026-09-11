import { check, section } from '../../lib/check'
section('The driver can wait before sending an answer back.')

// A request can now produce a number OR a Promise of a number.
// await gets the answer in either case. The driver does the waiting;
// the program is still an ordinary function* and receives a number.
// This is why we separated the program from the code running its work.
type Op = { run: () => number | Promise<number> }

async function run(
	program: () => Generator<Op, number, number>
): Promise<number> {
	const iterator = program()
	let step = iterator.next()
	while (!step.done) {
		const result = await step.value.run()
		step = iterator.next(result)
	}
	return step.value
}

// ---- checks (don't edit) ----
function* program(): Generator<Op, number, number> {
	const a = yield { run: () => 1 }
	const b = yield { run: () => Promise.resolve(a + 9) }
	return b * 2
}
check('driver sends resolved answers back', await run(program), 20)
