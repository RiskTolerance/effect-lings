import { Effect } from "effect";
import { check, section } from "../../lib/check";
section("acquireRelease pairs setup with guaranteed cleanup. Inside a scope, release runs when the scope closes — even on failure.");

const log: string[] = [];

const program = Effect.scoped(
  Effect.gen(function* () {
    // acquireRelease registers the release with the surrounding scope the moment
    // the resource is acquired. Effect.scoped opens that scope and — crucially —
    // closes it when the body finishes, running every registered release (LIFO),
    // whether the body succeeded, failed, or was interrupted.
    yield* Effect.acquireRelease(
      Effect.sync(() => {
        log.push("open");
        return "conn";
      }),
      () => Effect.sync(() => void log.push("close")),
    );

    log.push("use");
  }),
);

// ---- checks (don't edit) ----
await Effect.runPromise(program);
check("acquire runs, then use, then release fires automatically on scope close", log, [
  "open",
  "use",
  "close",
]);
