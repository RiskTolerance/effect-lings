# effect-practice

A self-checking, streak-tracking drill repo for **Effect** and the JS/TS primitives underneath it. Built for the real problem — _sticking with it_ — not for completeness.

The design goal is **zero friction**: one command runs the next exercise, checks your work, and tells you what's next. No deciding, no setup, no blank page.

Runs on **[Bun](https://bun.sh)** — no separate TypeScript runner to install; Bun executes the `.ts` exercises directly.

## Setup (once)

```bash
bun install
```

(Need Bun? `curl -fsSL https://bun.sh/install | bash`, or `powershell -c "irm bun.sh/install.ps1 | iex"` on Windows.)

## The daily loop

```bash
bun start
```

That's the whole habit. It runs the next unsolved exercise. You'll see either:

- **green** — checks pass, your streak ticks up, it names the next one. Done for the day (or keep going).
- **red** — a clear `expected / received`. Open the named file, fill the `📝 TODO`, run `bun start` again.

Want instant feedback while editing instead of re-running by hand:

```bash
bun run watch     # re-checks the current exercise on every save
```

Other commands:

```bash
bun run list       # progress + streak
bun run reset      # wipe progress (start over)
bun run typecheck  # type-check every exercise + solution against Effect v4
```

## How an exercise works

Each file has a `📝 TODO` and a block of checks you don't touch. Fill the TODO until the checks go green. Example:

```ts
// 📝 TODO: make this generator yield 1, then 2, then 3.
function* count(): Generator<number> {
	// your code here
}
```

Stuck for more than a few minutes? The full answer is in `solutions/` mirroring the same path. Using it isn't cheating — being stuck for 20 minutes is how the habit dies. Read it, understand it, retype it from memory, move on.

## The order (and why)

It's deliberately bottom-up. The point is that **Effect's "magic" is mechanics you'll have already built by hand**:

1. **`01-generators`** — `yield`, the two-way `.next(value)` channel, and `yield*`. The actual primitive. Most people use Effect for months without understanding this; you'll start here.
2. **`02-mini-effect`** — build a ~15-line generator-driven interpreter that runs sync and async "ops." This _is_ `Effect.gen` in miniature: `yield*` is `await`, your driver loop is the runtime, a running driver is a fiber.
3. **`03-effect-basics`** — real Effect now. `succeed`/`runSync`, `Effect.gen` (which you'll recognize as the thing you just built), the typed error channel, then `pipe`/`map`/`flatMap`, lifting work in (`sync`/`try`/`tryPromise`), error handling (`catch`/`match`/`result`), and `Ref` state. The recognition is the payoff.
4. **`04-context`** — the **R channel**: services as interfaces in the context, `Layer.succeed`/`Layer.effect` to provide them, and layers that depend on other layers. This is Effect's dependency injection — the thing the example apps are built on.
5. **`05-concurrency`** — where fibers earn their keep: `Effect.all` (with a concurrency option), `fork`/`Fiber.join`, and `race`.
6. **`06-scheduling`** — `retry` and `repeat` driven by a `Schedule` (`recurs`, and the building block for backoff/spacing).
7. **`07-resources`** — `acquireRelease` + scopes: cleanup that's guaranteed to run, even on failure or interruption.

Phase 1–2 are short and the part you'll be tempted to skip. They're the whole point for grounding the abstract stuff — do them. Blocks 4–7 are the "advanced" Effect most tutorials jump straight to; they land far better once 1–3 have demystified the machinery.

## From drills to real apps

Once the basics click, the `examples/` directory shows the same primitives wired into real web frameworks. Each is a standalone Bun project with its own README and install:

- **[`examples/hono-effect`](examples/hono-effect)** — a REST API where [Hono](https://hono.dev) is the web layer and Effect owns the logic: services, layers, typed errors, and `Schema` validation, all verified with `bun test` via Hono's in-memory `app.request()`. **Start here** — it's the deepest example.
- **[`examples/sveltekit-effect`](examples/sveltekit-effect)** — the _same_ Effect service pattern used in a [SvelteKit](https://svelte.dev/docs/kit) `load`, a form action, and a JSON API route. Shows the Effect side is framework-agnostic; only the thin bridge at the edge changes.

```bash
cd examples/hono-effect && bun install && bun test
```

## Extending it

Add a `.ts` file anywhere under `exercises/`. Files are picked up in sorted path order, so number them (`08-streams/01-...`). Import `{ check, section }` from `lib/check`, write a TODO + checks, done — and mirror the same path under `solutions/`. Keep checks comparing primitives or arrays of primitives (the tiny `equal` helper deep-compares arrays but uses `Object.is` for objects). Make the unsolved stub _type-check_ (so `bun run typecheck` stays green) while failing at runtime. Natural next blocks now that 1–7 exist: interruption + `Fiber.interrupt`, `Stream` (pull-based async iteration), `Queue`/`PubSub`, the software-transactional-memory (`TxRef`) family, and a deeper `Schema` block (transforms, branded types).

## Version note

Runs on **Effect v4** (`4.0.0-beta.86`) and **Bun 1.3+**. v4's core model is the same one you're drilling here — `Effect.gen`, the three channels (`A`/`E`/`R`), layers, fibers — so the muscle memory transfers directly. A few v4 surface details differ from the v3 you'll see in older blog posts, and the example apps call them out where they bite:

- Services are `Context.Service<Self, Shape>()("Key")` (v3's `Context.Tag` / `Effect.Service` are gone).
- The catch-all combinator is `Effect.catch` (v3's `Effect.catchAll`); `catchTag` / `catchTags` are unchanged.
- Schema lives at `effect/Schema`; decode untrusted input with `Schema.decodeUnknownEffect`.

Since v4 is still beta, the version is pinned exactly — don't float it.
