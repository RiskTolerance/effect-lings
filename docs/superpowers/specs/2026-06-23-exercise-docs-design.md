# Exercise Documentation Design

## Context

`effect-practice` is a small, self-checking drill repo. Each exercise should stay runnable with `bun start`, type-checkable before completion, and focused enough for daily practice.

The current exercise files mostly rely on one-line `section(...)` output plus terse TODO comments. That keeps friction low, but it can leave the learner without enough conceptual footing before solving a drill.

The project is pinned to `effect@4.0.0-beta.86`. The main Effect website has useful conceptual pages, but may not match v4 beta APIs in every detail. Exercise documentation should call this out where links are provided.

## Goal

Add concept-first, pre-exercise explanations throughout `exercises/**/*.ts`.

Each explanation should help the learner understand what concept they are about to practice, what shape the solution should have, and where to read more. It should not turn the exercise into a copied answer.

## Documentation Style

Use inline comments inside exercise files, near the top of each drill or immediately before the relevant TODO.

Preferred shape:

```ts
// Before you start:
// - Mental model: ...
// - Shape to look for: ...
// - Docs: ...
```

Rules:

- Keep the existing low-friction exercise loop. Do not add long prose to terminal output unless it is already useful as a short `section(...)`.
- Explain concepts before mechanics: why the API exists, what problem it models, and which type channel or runtime behavior matters.
- Include short code shapes when helpful, but avoid exact final code unless the existing exercise already includes that level of hint.
- Preserve TODO/check boundaries. Checks remain learner-facing verification, not hidden tests.
- Keep comments ASCII where practical.
- Do not update solutions unless an exercise change requires it.

## Link Strategy

Use direct docs links, but distinguish concept docs from v4 API reference:

- Primary API reference for Effect v4-compatible symbols: `https://effect-ts.github.io/effect/`
- Relevant module pages from the API reference: `Effect.ts`, `Context.ts`, `Layer.ts`, `Ref.ts`, `Fiber.ts`, `Schedule.ts`, `Scope.ts`, etc.
- Official concept pages on `effect.website` may be linked for mental models, with wording such as "Concept docs" when there is risk they describe v3-era API names.
- Local installed types in `node_modules/effect/dist/*.d.ts` are the tie-breaker for API shape because this repo pins `effect@4.0.0-beta.86`.

Examples of useful concept pages:

- Effect type: `https://effect.website/docs/getting-started/the-effect-type`
- Creating effects: `https://effect.website/docs/getting-started/creating-effects`
- Running effects: `https://effect.website/docs/getting-started/running-effects`
- Using generators: `https://effect.website/docs/getting-started/using-generators`
- Building pipelines: `https://effect.website/docs/getting-started/building-pipelines`
- Expected errors: `https://effect.website/docs/error-management/expected-errors`
- Services: `https://effect.website/docs/requirements-management/services`
- Layers: `https://effect.website/docs/requirements-management/layers`
- Ref: `https://effect.website/docs/state-management/ref`
- Basic concurrency: `https://effect.website/docs/concurrency/basic-concurrency`
- Fibers: `https://effect.website/docs/concurrency/fibers`
- Retrying: `https://effect.website/docs/error-management/retrying`
- Repetition: `https://effect.website/docs/scheduling/repetition`
- Scope: `https://effect.website/docs/resource-management/scope`

## Exercise Coverage

### `01-generators`

Add light JavaScript generator context. Keep this block about generator mechanics, not Effect internals.

Cover:

- `function*` returns an iterator.
- `yield` pauses and emits a value.
- `.next(value)` resumes and can feed a value back in.
- `yield*` delegates to another iterable/generator.

### `02-mini-effect`

Explain the interpreter mental model more clearly.

Cover:

- A yielded `Op<A>` is only a description of work.
- Driver reads `{ value, done }` from `.next()`.
- `done: false` means `value` is yielded work.
- Running the work gives a result.
- Passing that result into `.next(result)` resumes the generator and becomes the value of the suspended `yield`.
- Async driver has the same loop, except async ops are awaited before resuming.

### `03-effect-basics`

Add concept-first docs before each exercise.

Cover:

- `Effect<A, E, R>` means success, expected error, requirements.
- Effects are descriptions until run.
- `Effect.gen` is the real version of the mini driver.
- `Effect.fail` puts values in the expected error channel.
- `Data.TaggedError` makes failures matchable.
- `map` transforms plain success values; `flatMap` sequences Effect-returning work.
- `Effect.sync`, `Effect.try`, and `Effect.tryPromise` lift real work while preserving laziness and typed errors.
- Error-handling combinators can recover, collapse both channels, or capture results as values.
- `Ref` is effect-managed mutable state, safe to share across fibers.

### `04-context`

Clarify the R channel and layer construction.

Cover:

- Services are requirements stored in context.
- Yielding a service tag pulls the implementation from the context.
- Providing a layer satisfies a requirement.
- `Layer.succeed` provides ready values.
- `Layer.effect` builds services from effects, including allocation like `Ref.make`.
- Layers can require other layers; `Layer.provide` wires dependency graphs.

### `05-concurrency`

Explain concurrency as fibers, not promises.

Cover:

- `Effect.all` gathers results and can choose sequential or concurrent execution.
- Result order follows input order.
- `forkChild` starts child fibers within the current scope.
- `Fiber.join` awaits fiber completion and re-raises failures.
- `race` runs both effects, returns the winner, and interrupts the loser.

### `06-scheduling`

Clarify retry vs repeat.

Cover:

- `retry` reacts to failure.
- `repeat` reacts to success.
- `Schedule.recurs(n)` means "up to n retries" for retry and "n repeats after first run" for repeat.
- Schedules are reusable policies, not loops baked into the effect body.

### `07-resources`

Explain resource scope lifecycle.

Cover:

- `acquireRelease` pairs setup and cleanup.
- `Effect.scoped` opens a scope.
- Cleanup runs when the scope closes, including failures and interruption.
- User code should not call the release action manually.

## Testing

After documentation edits:

- Run `bun run typecheck`.
- Run representative exercises with `bun exercises/path/to/file.ts` if comments or hints risk changing code.
- If exercise code changes beyond comments, run `bun start` carefully so progress side effects are understood first.

## Non-Goals

- Do not rewrite the curriculum order.
- Do not add a separate docs site.
- Do not make explanations exhaustive.
- Do not change passing criteria unless a documentation pass exposes a real exercise bug.
- Do not replace exercises with answer walkthroughs.
