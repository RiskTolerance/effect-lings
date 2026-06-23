import { check, section } from "../../lib/check";
section("yield* delegates to another generator -- the same yield* Effect uses.");

function* inner(): Generator<number> {
  yield 1;
  yield 2;
}
function* outer(): Generator<number> {
  yield 0;
  yield* inner();
  yield 3;
}

check("yield* flattens delegated yields", [...outer()], [0, 1, 2, 3]);
