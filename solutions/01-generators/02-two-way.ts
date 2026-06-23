import { check, section } from "../../lib/check";
section("The trick: .next(value) PASSES a value back in.");
section("`const x = yield q` hands q OUT, and .next(v) makes v become x.");

function* conversation(): Generator<string, string, number> {
  const a: number = yield "give me a number";
  const b: number = yield "give me another";
  return `sum is ${a + b}`;
}

const it = conversation();
const q1 = it.next();
const q2 = it.next(10);
const done = it.next(5);

check("first yield asks", q1.value, "give me a number");
check("second yield asks", q2.value, "give me another");
check("return uses fed-in values", done.value, "sum is 15");
check("generator is done", done.done, true);
