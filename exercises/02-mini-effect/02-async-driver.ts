import { check, section } from '../../lib/check'
section('Add async. The driver awaits Async ops before resuming.')
section(
	'The driver awaits work and resumes the generator, like a small part of Effect.gen.'
)

/*
 * Before you start:
 * - Mental model: async does not change the driver loop. It only changes what
 *   happens before resuming the generator: async work must settle first.
 * - Shape to look for: inspect each yielded op, run sync ops directly, `await`
 *   async ops, then feed the produced value back into the generator.
 * - Docs: Effect API reference for the real runtime:
 *   https://effect-ts.github.io/effect/effect/Effect.ts.html
 */

type Op<A> =
	| { _tag: 'Sync'; run: () => A }
	| { _tag: 'Async'; run: () => Promise<A> }

const sync = <A>(run: () => A): Op<A> => ({
	_tag: 'Sync',
	run
})
const async = <A>(run: () => Promise<A>): Op<A> => ({
	_tag: 'Async',
	run
})

// 📝 TODO: same driver as before, but if the op is Async, `await` it before
//          feeding the result back in. (run() is now async.)
async function run<A>(
	program: () => Generator<Op<any>, A, any>
): Promise<A> {
	let op = program()
	let step = op.next()
	while (!step.done) {
		const result =
			step.value._tag === 'Async'
				? await step.value.run()
				: step.value.run()
		step = op.next(result)
	}
	return step.value
}

// ---- checks (don't edit) ----
const program = function* (): Generator<Op<any>, number, any> {
	const a = yield sync(() => 1)
	const b = yield async(() => Promise.resolve(a + 9))
	return b
}
check('async driver awaits then resumes', await run(program), 10)
