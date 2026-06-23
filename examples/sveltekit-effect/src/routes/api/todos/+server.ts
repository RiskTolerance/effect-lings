// A JSON API route (+server.ts) sharing the exact same Effect service as the
// page. GET lists todos; POST validates the body with Schema and creates one.
// `run` maps a TodoNotFound/InvalidInput failure onto the right HTTP status.

import { Effect } from "effect";
import { json } from "@sveltejs/kit";
import { CreateTodo, decode, run, TodoRepo } from "$lib/server/todos";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const todos = await run(
    Effect.gen(function* () {
      const repo = yield* TodoRepo;
      return yield* repo.list();
    }),
  );
  return json(todos);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const todo = await run(
    Effect.gen(function* () {
      const repo = yield* TodoRepo;
      const input = yield* decode(CreateTodo, body);
      return yield* repo.create(input.title);
    }),
  );
  return json(todo, { status: 201 });
};
