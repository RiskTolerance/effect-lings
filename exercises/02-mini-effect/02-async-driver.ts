import { check, section } from "../../lib/check";
section("Add async. The driver awaits Async ops before resuming.");
section("This is Effect.gen in miniature: yield* is await, the driver is the runtime.");

type Op<A> =
  | { _tag: "Sync"; run: () => A }
  | { _tag: "Async"; run: () => Promise<A> };

const sync = <A>(run: () => A): Op<A> => ({ _tag: "Sync", run });
const async = <A>(run: () => Promise<A>): Op<A> => ({ _tag: "Async", run });

// 📝 TODO: same driver as before, but if the op is Async, `await` it before
//          feeding the result back in. (run() is now async.)
async function run<A>(program: () => Generator<Op<any>, A, any>): Promise<A> {
  // your code here
  return undefined as any;
}

// ---- checks (don't edit) ----
const program = function* (): Generator<Op<any>, number, any> {
  const a = yield sync(() => 1);
  const b = yield async(() => Promise.resolve(a + 9));
  return b;
};
check("async driver awaits then resumes", await run(program), 10);
