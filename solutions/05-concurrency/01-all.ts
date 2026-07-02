import { Effect } from 'effect'
import { check, section } from '../../lib/check'
section(
	'Effect.all runs a collection of Effects and gathers their results — sequentially, or concurrently via an option.'
)

const double = (n: number) => Effect.succeed(n * 2)

// By default Effect.all runs the effects in sequence and collects an array.
const results: Effect.Effect<number[]> = Effect.all([
	double(1),
	double(2),
	double(3)
])

// { concurrency: "unbounded" } runs them all at once. The collected result is
// still in input order regardless of which finished first.
const concurrent: Effect.Effect<number[]> = Effect.all(
	[double(1), double(2), double(3)],
	{ concurrency: 'unbounded' }
)

// ---- checks (don't edit) ----
check(
	'all collects results in input order',
	await Effect.runPromise(results),
	[2, 4, 6]
)
check(
	'the concurrency option does not change result order',
	await Effect.runPromise(concurrent),
	[2, 4, 6]
)
