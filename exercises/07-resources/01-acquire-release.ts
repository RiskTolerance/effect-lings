import { Effect } from "effect";
import { check, section } from "../../lib/check";
section("acquireRelease pairs setup with guaranteed cleanup. Inside a scope, release runs when the scope closes — even on failure.");

// Before you start:
// - Mental model: a Scope owns resource lifetimes. `acquireRelease` registers a
//   finalizer when the resource is acquired, and the Scope runs that finalizer
//   when it closes.
// - Shape to look for: acquire the resource inside `Effect.scoped`, use it, and
//   let the scope call release automatically.
// - Docs: v4 API references:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   https://effect-ts.github.io/effect/effect/Scope.ts.html
//   Concept docs: https://effect.website/docs/resource-management/scope

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
