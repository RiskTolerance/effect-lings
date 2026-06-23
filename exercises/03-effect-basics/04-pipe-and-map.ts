import { Effect } from "effect";
import { check, section } from "../../lib/check";
section("Transform Effects without running them: .pipe + map (plain values) and flatMap (Effect-returning).");

const fetchUser = Effect.succeed({ name: "Ada", age: 36 });
const lookupAge = (name: string) => Effect.succeed(name === "Ada" ? 36 : 0);

// 📝 TODO: use fetchUser.pipe(Effect.map(...)) to derive an Effect<string>
//          that is the user's name, uppercased. Don't run it here.
const upperName: Effect.Effect<string> = Effect.succeed(""); // fix me

// 📝 TODO: starting from fetchUser, use Effect.flatMap to call lookupAge with
//          the user's name (it returns an Effect), then Effect.map to add 1.
const agePlusOne: Effect.Effect<number> = Effect.succeed(0); // fix me

// ---- checks (don't edit) ----
check("map transforms the success value", Effect.runSync(upperName), "ADA");
check("flatMap chains an Effect-returning step, then map adds 1", Effect.runSync(agePlusOne), 37);
