// These run with `bun test`. Hono's `app.request()` dispatches a Request
// through the whole stack — routing, the Effect handlers, the runtime, the
// in-memory repo — and returns a real Response, with no socket and no port.
// That makes the Effect↔HTTP bridge testable in milliseconds.
//
// Note: the in-memory store is shared across this file's requests (the runtime
// is a module singleton), so these tests run in declared order and build on the
// two seeded todos.

import { describe, expect, test } from "bun:test";
import { app } from "../src/routes.ts";

// app.request() returns a standard Response; .json() is `unknown`, so a tiny
// helper keeps the assertions readable without sprinkling casts everywhere.
const json = (res: Response): Promise<any> => res.json();

describe("GET /todos", () => {
  test("lists the seeded todos", async () => {
    const res = await app.request("/todos");
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body).toHaveLength(2);
    expect(body[0].title).toBe("Learn Effect generators");
  });
});

describe("GET /todos/:id", () => {
  test("returns one todo", async () => {
    const res = await app.request("/todos/1");
    expect(res.status).toBe(200);
    expect((await json(res)).id).toBe(1);
  });

  test("404s for a missing id", async () => {
    const res = await app.request("/todos/999");
    expect(res.status).toBe(404);
    expect((await json(res)).error).toBe("TodoNotFound");
  });

  test("400s for a non-numeric id", async () => {
    const res = await app.request("/todos/abc");
    expect(res.status).toBe(400);
    expect((await json(res)).error).toBe("InvalidInput");
  });
});

describe("POST /todos", () => {
  test("creates a todo from a valid body", async () => {
    const res = await app.request("/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Write tests" }),
    });
    expect(res.status).toBe(201);
    const body = await json(res);
    expect(body.id).toBe(3);
    expect(body.title).toBe("Write tests");
    expect(body.done).toBe(false);
  });

  test("400s on an empty title (Schema rejects it)", async () => {
    const res = await app.request("/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "" }),
    });
    expect(res.status).toBe(400);
    expect((await json(res)).error).toBe("InvalidInput");
  });

  test("400s when title is missing entirely", async () => {
    const res = await app.request("/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

describe("PATCH /todos/:id", () => {
  test("marks a todo done", async () => {
    const res = await app.request("/todos/2", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ done: true }),
    });
    expect(res.status).toBe(200);
    expect((await json(res)).done).toBe(true);
  });

  test("404s when updating a missing todo", async () => {
    const res = await app.request("/todos/999", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ done: true }),
    });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /todos/:id", () => {
  test("removes a todo (204) and it's gone afterward", async () => {
    const del = await app.request("/todos/1", { method: "DELETE" });
    expect(del.status).toBe(204);
    const after = await app.request("/todos/1");
    expect(after.status).toBe(404);
  });
});
