import { check, section } from "../../lib/check";
section("yield* delegates to another generator -- the same yield* Effect uses.");

function* inner(): Generator<number> {
  yield 1;
  yield 2;
}

// 📝 TODO: yield 0, then delegate to inner() with yield*, then yield 3.
function* outer(): Generator<number> {
  // your code here
}

// ---- checks (don't edit) ----
check("yield* flattens delegated yields", [...outer()], [0, 1, 2, 3]);
