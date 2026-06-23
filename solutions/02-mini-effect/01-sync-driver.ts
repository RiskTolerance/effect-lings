import { check, section } from "../../lib/check";
section("Build the engine. A 'program' yields descriptions of work.");
section("The driver runs each one and feeds the result back with .next().");

type Op<A> = { _tag: "Sync"; run: () => A };
const sync = <A>(run: () => A): Op<A> => ({ _tag: "Sync", run });

function run<A>(program: () => Generator<Op<any>, A, any>): A {
  const it = program();
  let step = it.next();
  while (!step.done) {
    const result = step.value.run();   // execute the yielded op
    step = it.next(result);            // feed its result back in
  }
  return step.value;
}

const program = function* (): Generator<Op<any>, number, any> {
  const a = yield sync(() => 2);
  const b = yield sync(() => a + 3);
  return b * 10;
};

check("driver threads results through yields", run(program), 50);
