import { check, section } from '../../lib/check'
section('Add async. Now the driver awaits Async ops before resuming.')
section(
	'The driver awaits work and resumes the generator, like a small part of Effect.gen.'
)

type Op<A> =
	| { _tag: 'Sync'; run: () => A }
	| { _tag: 'Async'; run: () => Promise<A> }

const sync = <A>(run: () => A): Op<A> => ({ _tag: 'Sync', run })
const async = <A>(run: () => Promise<A>): Op<A> => ({
	_tag: 'Async',
	run
})

async function run<A>(
	program: () => Generator<Op<any>, A, any>
): Promise<A> {
	const it = program()
	let step = it.next()
	while (!step.done) {
		const op = step.value
		const result = op._tag === 'Sync' ? op.run() : await op.run()
		step = it.next(result)
	}
	return step.value
}

const program = function* (): Generator<Op<any>, number, any> {
	const a = yield sync(() => 1)
	const b = yield async(() => Promise.resolve(a + 9))
	return b
}

check('async driver awaits then resumes', await run(program), 10)
