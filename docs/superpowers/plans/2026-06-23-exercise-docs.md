# Exercise Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add concept-first pre-exercise explanation comments and direct documentation links across the Effect practice exercise files.

**Architecture:** Keep documentation inside each exercise file, near the learner's starting point, so `bun start` remains low-noise. Use short comment blocks that explain mental model, solution shape, and docs links without giving full answers. Treat installed `effect@4.0.0-beta.86` types as the API source of truth; label `effect.website` links as concept docs when useful.

**Tech Stack:** Bun, TypeScript, Effect `4.0.0-beta.86`, existing `lib/check.ts` exercise runner.

---

## File Map

- Modify `exercises/01-generators/01-yield-basics.ts`: add generator basics comment.
- Modify `exercises/01-generators/02-two-way.ts`: add resume-value comment.
- Modify `exercises/01-generators/03-delegation.ts`: add delegation comment while preserving existing solved code.
- Modify `exercises/02-mini-effect/01-sync-driver.ts`: add driver loop anatomy comment while preserving existing solved code.
- Modify `exercises/02-mini-effect/02-async-driver.ts`: add async driver comment.
- Modify `exercises/03-effect-basics/01-succeed-run.ts`: add Effect type and running comment.
- Modify `exercises/03-effect-basics/02-gen.ts`: add `Effect.gen` bridge comment.
- Modify `exercises/03-effect-basics/03-typed-errors.ts`: add expected error and tagged error comment.
- Modify `exercises/03-effect-basics/04-pipe-and-map.ts`: add transform vs sequence comment.
- Modify `exercises/03-effect-basics/05-sync-and-async.ts`: add constructors and laziness comment.
- Modify `exercises/03-effect-basics/06-error-handling.ts`: add recovery/collapse/capture comment.
- Modify `exercises/03-effect-basics/07-state-with-ref.ts`: add Ref state comment.
- Modify `exercises/04-context/01-service.ts`: add R channel/service comment.
- Modify `exercises/04-context/02-layers.ts`: add layer construction comment.
- Modify `exercises/04-context/03-layered-deps.ts`: add layer dependency graph comment.
- Modify `exercises/05-concurrency/01-all.ts`: add `Effect.all` ordering/concurrency comment.
- Modify `exercises/05-concurrency/02-fork-join.ts`: add fiber fork/join comment.
- Modify `exercises/05-concurrency/03-race.ts`: add race/interruption comment.
- Modify `exercises/06-scheduling/01-retry.ts`: add retry policy comment.
- Modify `exercises/06-scheduling/02-repeat.ts`: add repeat policy comment.
- Modify `exercises/07-resources/01-acquire-release.ts`: add scoped resource lifecycle comment.

Commit note: current worktree already has pre-existing exercise edits in `exercises/01-generators/03-delegation.ts` and `exercises/02-mini-effect/01-sync-driver.ts`. Do not commit implementation changes unless the user explicitly approves committing mixed exercise state.

### Task 1: Generators

**Files:**
- Modify: `exercises/01-generators/01-yield-basics.ts`
- Modify: `exercises/01-generators/02-two-way.ts`
- Modify: `exercises/01-generators/03-delegation.ts`

- [ ] **Step 1: Add concept comments to generator exercises**

Insert these comments after the existing `section(...)` calls in each file.

For `01-yield-basics.ts`:

```ts
// Before you start:
// - Mental model: calling a generator function does not run its body right away.
//   It gives you an iterator. Each `.next()` runs until the next `yield`.
// - Shape to look for: three pauses that emit 1, 2, and 3. When the function
//   reaches the end, the next result has `done: true`.
// - Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
```

For `02-two-way.ts`:

```ts
// Before you start:
// - Mental model: `yield` is a two-way pause. It sends a value out, then waits.
//   The next `.next(value)` call resumes the generator, and that `value`
//   becomes the result of the paused `yield` expression.
// - Shape to look for: yield a question, receive a number, yield another
//   question, receive another number, then return the computed string.
// - Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator/next
```

For `03-delegation.ts`:

```ts
// Before you start:
// - Mental model: `yield*` lets one generator hand control to another iterable.
//   The outer generator emits every value from the inner one before continuing.
// - Shape to look for: one local yield, one delegated sequence, then one final
//   local yield.
// - Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*
```

- [ ] **Step 2: Run generator exercises**

Run:

```bash
bun exercises/01-generators/01-yield-basics.ts
bun exercises/01-generators/02-two-way.ts
bun exercises/01-generators/03-delegation.ts
```

Expected: each command exits 0 and prints passing checks. If `03-delegation.ts` is already solved locally, preserve that solved code.

### Task 2: Mini Effect Driver

**Files:**
- Modify: `exercises/02-mini-effect/01-sync-driver.ts`
- Modify: `exercises/02-mini-effect/02-async-driver.ts`

- [ ] **Step 1: Add sync driver anatomy comment**

Insert after the `section(...)` calls in `01-sync-driver.ts`:

```ts
// Before you start:
// - Mental model: the generator is a tiny program, and each yielded `Op` is a
//   description of work. The driver is the runtime that executes descriptions.
// - Shape to look for: call `gen.next()` to get `{ value, done }`. While
//   `done` is false, `value` is the yielded `Op`; run it, then pass the result
//   back with `gen.next(result)`. When `done` is true, `value` is the program's
//   final return value.
// - Docs: JS generator result shape:
//   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator/next
```

- [ ] **Step 2: Add async driver comment**

Insert after the `section(...)` calls in `02-async-driver.ts`:

```ts
// Before you start:
// - Mental model: async does not change the driver loop. It only changes what
//   happens before resuming the generator: async work must settle first.
// - Shape to look for: inspect each yielded op, run sync ops directly, `await`
//   async ops, then feed the produced value back into the generator.
// - Docs: Effect API reference for the real runtime:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
```

- [ ] **Step 3: Run mini-effect exercises**

Run:

```bash
bun exercises/02-mini-effect/01-sync-driver.ts
bun exercises/02-mini-effect/02-async-driver.ts
```

Expected: `01-sync-driver.ts` exits 0 if already solved locally; `02-async-driver.ts` may fail until learner solves it, but comments must not introduce TypeScript/runtime errors.

### Task 3: Effect Basics

**Files:**
- Modify: `exercises/03-effect-basics/01-succeed-run.ts`
- Modify: `exercises/03-effect-basics/02-gen.ts`
- Modify: `exercises/03-effect-basics/03-typed-errors.ts`
- Modify: `exercises/03-effect-basics/04-pipe-and-map.ts`
- Modify: `exercises/03-effect-basics/05-sync-and-async.ts`
- Modify: `exercises/03-effect-basics/06-error-handling.ts`
- Modify: `exercises/03-effect-basics/07-state-with-ref.ts`

- [ ] **Step 1: Add comments to each Effect basics exercise**

Insert these comments after each file's existing `section(...)` call.

For `01-succeed-run.ts`:

```ts
// Before you start:
// - Mental model: `Effect<A, E, R>` describes work that can succeed with `A`,
//   fail with expected error `E`, and require services `R`. It is a value, not
//   the result itself.
// - Shape to look for: build a success description with `Effect.succeed`, then
//   run it at the edge with `Effect.runSync`.
// - Docs: v4 API reference:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   Concept docs: https://effect.website/docs/getting-started/the-effect-type
```

For `02-gen.ts`:

```ts
// Before you start:
// - Mental model: `Effect.gen` is the production version of the driver you just
//   built. `yield*` waits for an Effect and gives you its success value.
// - Shape to look for: bind one Effect result, use it to build the next Effect,
//   then return a plain final value from the generator.
// - Docs: v4 API reference:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   Concept docs: https://effect.website/docs/getting-started/using-generators
```

For `03-typed-errors.ts`:

```ts
// Before you start:
// - Mental model: expected failures are values in the `E` channel, not thrown
//   exceptions. Tagged errors give those values a stable `_tag` for recovery.
// - Shape to look for: choose between `Effect.succeed` and `Effect.fail`, then
//   recover only the matching tag with `Effect.catchTag`.
// - Docs: v4 API references:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   https://effect-ts.github.io/effect/effect/Data.ts.html
//   Concept docs: https://effect.website/docs/error-management/expected-errors
```

For `04-pipe-and-map.ts`:

```ts
// Before you start:
// - Mental model: `map` changes a successful plain value inside an Effect.
//   `flatMap` is for a callback that returns another Effect, so the result is
//   flattened instead of becoming an Effect inside an Effect.
// - Shape to look for: keep building descriptions; do not run them until the
//   checks.
// - Docs: v4 API reference:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   Concept docs: https://effect.website/docs/getting-started/building-pipelines
```

For `05-sync-and-async.ts`:

```ts
// Before you start:
// - Mental model: constructors lift real work into Effect. `sync` delays
//   non-throwing sync work, `try` catches thrown sync errors, and `tryPromise`
//   catches rejected promises.
// - Shape to look for: wrap work in thunks so it stays lazy and errors land in
//   the typed error channel.
// - Docs: v4 API reference:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   Concept docs: https://effect.website/docs/getting-started/creating-effects
```

For `06-error-handling.ts`:

```ts
// Before you start:
// - Mental model: handling errors changes the `E` channel. You can recover to a
//   default, collapse success/failure into one success type, or capture the
//   outcome as data.
// - Shape to look for: after `safe`, no error remains; after `described`, both
//   paths become strings; after `captured`, failure becomes a `Result` value.
// - Docs: v4 API references:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   https://effect-ts.github.io/effect/effect/Result.ts.html
//   Concept docs: https://effect.website/docs/error-management/expected-errors
```

For `07-state-with-ref.ts`:

```ts
// Before you start:
// - Mental model: `Ref` is mutable state described and accessed through Effects.
//   Reads and updates are effects too, so they compose with `Effect.gen` and
//   stay safe across fibers.
// - Shape to look for: create the Ref inside the program, yield updates in
//   order, then yield a final read. `modify` returns one value while storing
//   another.
// - Docs: v4 API reference:
//   https://effect-ts.github.io/effect/effect/Ref.ts.html
//   Concept docs: https://effect.website/docs/state-management/ref
```

- [ ] **Step 2: Typecheck Effect basics comments**

Run:

```bash
bun run typecheck
```

Expected: command result matches pre-change typecheck behavior. Comments must not create new failures.

### Task 4: Context And Layers

**Files:**
- Modify: `exercises/04-context/01-service.ts`
- Modify: `exercises/04-context/02-layers.ts`
- Modify: `exercises/04-context/03-layered-deps.ts`

- [ ] **Step 1: Add comments to context exercises**

Insert these comments after each file's existing `section(...)` call.

For `01-service.ts`:

```ts
// Before you start:
// - Mental model: the `R` channel is a list of services the program needs from
//   its environment. A service tag is the key used to request an implementation.
// - Shape to look for: `yield* Greeter` adds a Greeter requirement; providing
//   `GreeterLive` removes that requirement before running.
// - Docs: v4 API references:
//   https://effect-ts.github.io/effect/effect/Context.ts.html
//   https://effect-ts.github.io/effect/effect/Layer.ts.html
//   Concept docs: https://effect.website/docs/requirements-management/services
```

For `02-layers.ts`:

```ts
// Before you start:
// - Mental model: a Layer is a recipe for building services. `Layer.succeed`
//   wraps an already-built service; `Layer.effect` can allocate effectful state
//   while building the service.
// - Shape to look for: allocate the Ref once during layer construction, then
//   expose methods that reuse that same Ref for every call.
// - Docs: v4 API reference:
//   https://effect-ts.github.io/effect/effect/Layer.ts.html
//   Concept docs: https://effect.website/docs/requirements-management/layers
```

For `03-layered-deps.ts`:

```ts
// Before you start:
// - Mental model: layers can need other services while they are being built.
//   That requirement belongs to the layer construction step, not to the service
//   interface callers use afterward.
// - Shape to look for: build Greeter from Config, then provide ConfigLive to
//   GreeterLive so the final runnable program only needs Greeter.
// - Docs: v4 API reference:
//   https://effect-ts.github.io/effect/effect/Layer.ts.html
//   Concept docs: https://effect.website/docs/requirements-management/layers
```

- [ ] **Step 2: Typecheck context comments**

Run:

```bash
bun run typecheck
```

Expected: command result matches pre-change typecheck behavior.

### Task 5: Concurrency

**Files:**
- Modify: `exercises/05-concurrency/01-all.ts`
- Modify: `exercises/05-concurrency/02-fork-join.ts`
- Modify: `exercises/05-concurrency/03-race.ts`

- [ ] **Step 1: Add comments to concurrency exercises**

Insert these comments after each file's existing `section(...)` call.

For `01-all.ts`:

```ts
// Before you start:
// - Mental model: `Effect.all` combines many Effect descriptions into one
//   description. It controls execution strategy, but the collected result keeps
//   the same order as the input collection.
// - Shape to look for: one version with default execution, one version with
//   `{ concurrency: "unbounded" }`.
// - Docs: v4 API reference:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   Concept docs: https://effect.website/docs/concurrency/basic-concurrency
```

For `02-fork-join.ts`:

```ts
// Before you start:
// - Mental model: a Fiber is Effect's lightweight unit of concurrent work.
//   Forking starts work in the background; joining waits for its result and
//   preserves its failure behavior.
// - Shape to look for: fork both effects before joining either one, so they can
//   run at the same time.
// - Docs: v4 API references:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   https://effect-ts.github.io/effect/effect/Fiber.ts.html
//   Concept docs: https://effect.website/docs/concurrency/fibers
```

For `03-race.ts`:

```ts
// Before you start:
// - Mental model: `race` starts both effects, completes with the first result,
//   and interrupts the loser so it does not keep running useless work.
// - Shape to look for: combine `fast` and `slow` into one Effect whose success
//   value is whichever finishes first.
// - Docs: v4 API reference:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   Concept docs: https://effect.website/docs/concurrency/basic-concurrency
```

- [ ] **Step 2: Run concurrency exercises**

Run:

```bash
bun exercises/05-concurrency/01-all.ts
bun exercises/05-concurrency/02-fork-join.ts
bun exercises/05-concurrency/03-race.ts
```

Expected: unsolved exercises may fail their checks. They must still execute and report exercise failures rather than syntax/import errors.

### Task 6: Scheduling And Resources

**Files:**
- Modify: `exercises/06-scheduling/01-retry.ts`
- Modify: `exercises/06-scheduling/02-repeat.ts`
- Modify: `exercises/07-resources/01-acquire-release.ts`

- [ ] **Step 1: Add comments to scheduling and resource exercises**

Insert these comments after each file's existing `section(...)` call.

For `01-retry.ts`:

```ts
// Before you start:
// - Mental model: `retry` is for failures. The original Effect is attempted,
//   and the Schedule decides whether a failure should trigger another attempt.
// - Shape to look for: run `flaky` through `Effect.retry` with a policy that
//   allows enough retries to reach the third attempt.
// - Docs: v4 API references:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   https://effect-ts.github.io/effect/effect/Schedule.ts.html
//   Concept docs: https://effect.website/docs/error-management/retrying
```

For `02-repeat.ts`:

```ts
// Before you start:
// - Mental model: `repeat` is for successes. The first run happens once, then
//   the Schedule decides how many successful repetitions follow.
// - Shape to look for: `Schedule.recurs(3)` means three repeats after the first
//   run, so the effect runs four times total.
// - Docs: v4 API references:
//   https://effect-ts.github.io/effect/effect/Effect.ts.html
//   https://effect-ts.github.io/effect/effect/Schedule.ts.html
//   Concept docs: https://effect.website/docs/scheduling/repetition
```

For `01-acquire-release.ts`:

```ts
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
```

- [ ] **Step 2: Run scheduling and resource exercises**

Run:

```bash
bun exercises/06-scheduling/01-retry.ts
bun exercises/06-scheduling/02-repeat.ts
bun exercises/07-resources/01-acquire-release.ts
```

Expected: unsolved exercises may fail their checks. They must still execute and report exercise failures rather than syntax/import errors.

### Task 7: Final Verification

**Files:**
- Verify: `exercises/**/*.ts`

- [ ] **Step 1: Run typecheck**

Run:

```bash
bun run typecheck
```

Expected: TypeScript completes with no errors, or any remaining error is proven to pre-exist documentation changes.

- [ ] **Step 2: Inspect diff for answer leakage**

Run:

```bash
git diff -- exercises
```

Expected: diff mostly adds `Before you start` comments. It must not replace exercise stubs with answers, except preserving pre-existing local solutions in `03-delegation.ts` and `01-sync-driver.ts`.

- [ ] **Step 3: Report changed files and verification**

Summarize:

```text
Changed: 21 exercise files
Verification: bun run typecheck
Note: no implementation commit made because target files included pre-existing local edits
```
