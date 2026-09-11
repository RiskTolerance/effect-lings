import { Context, Effect, Layer, Ref } from 'effect'
import { check, section } from '../../lib/check'
section(
	'Layer.succeed wraps a ready value; Layer.effect BUILDS the service from an Effect — so it can allocate state.'
)

class Counter extends Context.Service<
	Counter,
	{ readonly next: () => Effect.Effect<number> }
>()('Counter') {}

// The construction Effect runs once, when the layer is built. The Ref it
// allocates is captured by `next`, so every caller shares one counter.
const CounterLive: Layer.Layer<Counter> = Layer.effect(Counter)(
	Effect.gen(function* () {
		const ref = yield* Ref.make(0)
		return Counter.of({
			next: () => Ref.updateAndGet(ref, (n) => n + 1)
		})
	})
)

const program = Effect.gen(function* () {
	const counter = yield* Counter
	return [
		yield* counter.next(),
		yield* counter.next(),
		yield* counter.next()
	]
})

// ---- checks (don't edit) ----
check(
	'each next() advances the state held inside the layer',
	Effect.runSync(program.pipe(Effect.provide(CounterLive))),
	[1, 2, 3]
)
