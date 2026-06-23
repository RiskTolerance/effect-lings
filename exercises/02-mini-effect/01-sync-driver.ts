import { check, section } from "../../lib/check";
section("Build the engine. A 'program' yields descriptions of work.");
section("The driver runs each one and feeds the result back with .next().");

type Op<A> = { _tag: "Sync"; run: () => A };
const sync = <A>(run: () => A): Op<A> => ({ _tag: "Sync", run });

// 📝 TODO: drive the generator. For each yielded op:
//          1. call op.run() to get a result
//          2. pass that result back in with it.next(result)
//          Return the generator's final value when done.
function run<A>(program: () => Generator<Op<any>, A, any>): A {
  // your code here
  return undefined as any;
}

// ---- checks (don't edit) ----
const program = function* (): Generator<Op<any>, number, any> {
  const a = yield sync(() => 2);
  const b = yield sync(() => a + 3);
  return b * 10;
};
check("driver threads results through yields", run(program), 50);
