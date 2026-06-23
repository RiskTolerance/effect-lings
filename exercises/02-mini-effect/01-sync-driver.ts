import { check, section } from "../../lib/check"
section("Build the engine. A 'program' yields descriptions of work.")
section("The driver runs each one and feeds the result back with .next().")

// Before you start:
// - Mental model: the generator is a tiny program, and each yielded `Op` is a
//   description of work. The driver is the runtime that executes descriptions.
// - Shape to look for: call `gen.next()` to get `{ value, done }`. While
//   `done` is false, `value` is the yielded `Op`; run it, then pass the result
//   back with `gen.next(result)`. When `done` is true, `value` is the program's
//   final return value.
// - Docs: JS generator result shape:
//   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator/next

type Op<A> = { _tag: "Sync"; run: () => A }
const sync = <A>(run: () => A): Op<A> => ({ _tag: "Sync", run })

// 📝 TODO: drive the generator. For each yielded op:
//          1. call op.run() to get a result
//          2. pass that result back in with it.next(result)
//          Return the generator's final value when done.
function run<A>(program: () => Generator<Op<any>, A, any>): A {
  const gen = program()
  let step = gen.next()
  while (!step.done) {
    const res = step.value.run()
    step = gen.next(res)
  }
  return step.value as any
}

// ---- checks (don't edit) ----
const program = function* (): Generator<Op<any>, number, any> {
  const a = yield sync(() => 2)
  const b = yield sync(() => a + 3)
  return b * 10
}
check("driver threads results through yields", run(program), 50)
