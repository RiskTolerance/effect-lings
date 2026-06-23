// The bridge between Hono (Promise<Response> world) and Effect.
//
// Two ideas do all the work:
//   1. A ManagedRuntime builds the layers (the Ref-backed repo) exactly ONCE,
//      then hands out a fast `runPromiseExit` for each request. No re-wiring
//      dependencies per call.
//   2. Handlers return an Effect that has *already* mapped every expected
//      failure to a Response (via Effect.catchTags in routes.ts). So the only
//      thing left to translate here is an unexpected *defect* — that becomes a
//      500 instead of a hung request.

import { Effect, Exit, ManagedRuntime } from "effect";
import { TodoRepo, TodoRepoMemory } from "./repo.ts";

// The app's dependency graph. Add more layers with Layer.merge as the app grows.
export const AppLayer = TodoRepoMemory;

/** Services available to a route handler — i.e. what AppLayer provides. */
export type AppServices = TodoRepo;

export const runtime = ManagedRuntime.make(AppLayer);

/**
 * Run a fully-recovered handler Effect to a Response. The Effect's error
 * channel must already be `never` (all expected errors caught to Responses);
 * anything still failing here is a bug, and we surface it as a 500.
 */
export const toResponse = async (
  effect: Effect.Effect<Response, never, AppServices>,
): Promise<Response> => {
  const exit = await runtime.runPromiseExit(effect);
  if (Exit.isSuccess(exit)) return exit.value;
  console.error("Unhandled defect in handler:", exit.cause);
  return Response.json({ error: "InternalServerError" }, { status: 500 });
};
