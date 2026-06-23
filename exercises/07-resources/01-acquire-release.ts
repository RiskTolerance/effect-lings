import { Effect } from "effect";
import { check, section } from "../../lib/check";
section("acquireRelease pairs setup with guaranteed cleanup. Inside a scope, release runs when the scope closes — even on failure.");

const log: string[] = [];

const program = Effect.scoped(
  Effect.gen(function* () {
    // 📝 TODO: acquire a resource with Effect.acquireRelease(acquire, release):
    //          acquire = Effect.sync(() => { log.push("open"); return "conn"; })
    //          release = () => Effect.sync(() => { log.push("close"); })
    //          You don't call release yourself — the scope does, after "use".

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
