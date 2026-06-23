import { check, section } from "../../lib/check"
section("Add async. The driver awaits Async ops before resuming.")
section("This is Effect.gen in miniature: yield* is await, the driver is the runtime.")

// Before you start:
// - Mental model: async does not change the driver loop. It only changes what
//   happens before resuming the generator: async work must settle first.
// - Shape to look for: inspect each yielded op, run sync ops directly, `await`
//   async ops, then feed the produced value back into the generator.
// - Docs: Effect API reference for the real runtime:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html#gen
//   Concept docs: https://effect.website/docs/getting-started/using-generators/#comparing-effectgen-with-asyncawait

type Op<A> =
  | { _tag: "Sync"; run: () => A }
  | { _tag: "Async"; run: () => Promise<A> }

const sync = <A>(run: () => A): Op<A> => ({ _tag: "Sync", run })
const async = <A>(run: () => Promise<A>): Op<A> => ({ _tag: "Async", run })

// 📝 TODO: same driver as before, but if the op is Async, `await` it before
//          feeding the result back in. (run() is now async.)
async function run<A>(program: () => Generator<Op<any>, A, any>): Promise<A> {

  let gen = program()
  let step = gen.next()
  while (!step.done) {
    if (step.value._tag === 'Async') {
      const res = await step.value.run()
      step = gen.next(res)
    } else {
      const res = step.value.run()
      step = gen.next(res)
    }
  }
  return step.value as any
}

// ---- checks (don't edit) ----
const program = function* (): Generator<Op<any>, number, any> {
  const a = yield sync(() => 1)
  const b = yield async(() => Promise.resolve(a + 9))
  return b
}
check("async driver awaits then resumes", await run(program), 10)
