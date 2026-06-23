# sveltekit-effect

A small **[SvelteKit](https://svelte.dev/docs/kit)** app that uses **Effect** for its server logic — in a page `load`, a form action, and a JSON API route. It deliberately reuses the *same* service/layer/typed-error pattern as the [`hono-effect`](../hono-effect) example, to show that the Effect side is framework-agnostic: only the thin bridge at the edge changes.

## Run it

```bash
bun install        # also runs `svelte-kit sync`
bun dev            # http://localhost:5173
```

Open the page to see todos loaded by an Effect and add one through the form. Or hit the JSON API:

```bash
curl localhost:5173/api/todos
curl -X POST localhost:5173/api/todos -H 'content-type: application/json' -d '{"title":"Read the SvelteKit docs"}'
```

Type-check and build:

```bash
bun run check      # svelte-check, 0 errors
bun run build      # @risk-tolerance/svelte-adapter-bun → ./build
bun build/index.js     # run the production server on Bun.serve
```

## How it's wired

| File | Role |
|------|------|
| [`src/lib/server/todos.ts`](src/lib/server/todos.ts) | **All the Effect code**: the `Todo` schema, typed errors, a `TodoRepo` service with an in-memory `Ref` layer, a `ManagedRuntime`, and the `run` bridge. `$lib/server` is guaranteed server-only by SvelteKit. |
| [`src/routes/+page.server.ts`](src/routes/+page.server.ts) | A `load` that runs an Effect to list todos, and a `create` form action that validates with `Schema` and reports errors back to the form. |
| [`src/routes/+page.svelte`](src/routes/+page.svelte) | Svelte 5 (runes) UI: renders the loaded todos and a progressively-enhanced form. |
| [`src/routes/api/todos/+server.ts`](src/routes/api/todos/+server.ts) | A JSON API (`GET`/`POST`) backed by the same `TodoRepo` service. |

## The one idea to take away

The bridge is tiny and lives in one place — the `run` helper:

```ts
const run = async (effect) => {
  const exit = await runtime.runPromiseExit(effect);
  if (Exit.isSuccess(exit)) return exit.value;
  const failure = Option.getOrUndefined(Cause.findErrorOption(exit.cause));
  if (failure?._tag === "TodoNotFound") throw error(404, …);
  if (failure?._tag === "InvalidInput") throw error(400, …);
  throw error(500, …); // a defect, not an expected failure
};
```

A `load`, an action, and an API route all call it. The typed error channel (`TodoNotFound | InvalidInput`) is what lets the bridge map failures to the right HTTP status — and what makes a forgotten case a *compile* error.

## Effect v4 notes

Same v4 API as the Hono example: `Context.Service<Self, Shape>()("Key")` for services, `Schema.decodeUnknownEffect` for validation, `Effect.catch`/`catchTag`/`catchTags` for recovery, and `Cause.findErrorOption` + `Option.getOrUndefined` to pull the typed failure out of a failed `Exit`.
