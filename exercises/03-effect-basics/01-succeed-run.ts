import { Effect } from "effect";
import { check, section } from "../../lib/check";
section("Effect<A,E,R> is a *description*. Nothing runs until you run it.");

// 📝 TODO: create an Effect that succeeds with 42 (Effect.succeed),
//          then execute it with Effect.runSync and store the result.
const program = Effect.succeed(0 /* fix me */);
const value = 0; // 📝 replace with Effect.runSync(program)

// ---- checks (don't edit) ----
check("runSync of succeed(42)", value, 42);
check("succeed is lazy: it's an object, not the value", typeof program === "object", true);
