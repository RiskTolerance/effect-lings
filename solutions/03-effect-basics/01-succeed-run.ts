import { Effect } from "effect";
import { check, section } from "../../lib/check";
section("Effect<A,E,R> is a *description* of a computation. Nothing runs until you run it.");

const program = Effect.succeed(42);          // a value lifted into Effect
const value = Effect.runSync(program);       // execute it

check("runSync of succeed(42)", value, 42);
check("succeed is lazy: it's an object, not the value", typeof program === "object", true);
