# hono-effect

A small REST API (a todo list) where **[Hono](https://hono.dev)** is the web layer and **Effect** owns the business logic. It's the real-world payoff for the drills in the root repo: the `Effect.gen`, services, typed errors, and `Schema` you practiced there, wired into something that actually serves HTTP.

## Run it

```bash
bun install
bun dev        # watch mode on http://localhost:3000
# or: bun start
```

```bash
curl localhost:3000/todos
curl localhost:3000/todos/1
curl -X POST localhost:3000/todos -H 'content-type: application/json' -d '{"title":"Read the Effect docs"}'
curl -X PATCH localhost:3000/todos/2 -H 'content-type: application/json' -d '{"done":true}'
curl -X DELETE localhost:3000/todos/1
```

## Run the tests

```bash
bun test
```

The tests use Hono's `app.request()`, which pushes a `Request` through the whole stack and hands back a `Response` — no socket, no port. The entire Effect↔HTTP bridge is verified in milliseconds.

## How it's wired (read in this order)

| File | Role |
|------|------|
| [`src/domain.ts`](src/domain.ts) | The `Todo` entity, request `Schema`s, and typed errors (`TodoNotFound`, `InvalidInput`). Knows nothing about HTTP. |
| [`src/repo.ts`](src/repo.ts) | `TodoRepo`, a **service** (`Context.Service`) with an in-memory **layer** backed by a `Ref`. Swap it for a SQL layer and nothing above changes. |
| [`src/runtime.ts`](src/runtime.ts) | The bridge: a `ManagedRuntime` builds the layers **once**, plus `toResponse` to run a handler and turn an unexpected defect into a 500. |
| [`src/routes.ts`](src/routes.ts) | The Hono routes. Each handler is an `Effect` that decodes input, calls the repo, and `catchTags` every expected error into the right status code. |
| [`src/server.ts`](src/server.ts) | Bun entry point — a default export with a `fetch` method. |

## The three ideas worth taking away

1. **Services + layers = swappable dependencies.** Routes depend on the `TodoRepo` *interface*, never a concrete class. The in-memory layer is one `Layer.effect`; a database layer would be a drop-in replacement.

2. **Errors are values in the type.** `repo.get` returns `Effect<Todo, TodoNotFound>`. The compiler *forces* the route to deal with `TodoNotFound` before the Effect can be run — so a forgotten 404 is a type error, not a production incident.

3. **One bridge, built once.** `ManagedRuntime.make(AppLayer)` constructs the dependency graph a single time. Each request is just `runtime.runPromiseExit(handler)` — fast, and the in-memory store persists across requests because the layer is a singleton.

## Effect v4 notes

This uses Effect **v4** (beta), whose API differs from the v3 you'll see in most blog posts:

- Services: `Context.Service<Self, Shape>()("Key")` (v3's `Context.Tag` / `Effect.Service` are gone).
- Catch-all is `Effect.catch` (v3's `Effect.catchAll`); `catchTag` / `catchTags` are unchanged.
- Decode untrusted input with `Schema.decodeUnknownEffect(schema)(input)`, which fails with a `SchemaError` in the E channel.
- Non-empty strings: `Schema.NonEmptyString` (or `Schema.String.check(Schema.isMinLength(1))`).
