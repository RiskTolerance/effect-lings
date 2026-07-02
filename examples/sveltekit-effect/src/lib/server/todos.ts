// Server-only Effect code, shared by the page `load` and the JSON API route.
// SvelteKit guarantees anything under `$lib/server` never reaches the browser.
//
// This is the same shape as the hono-effect example — a service, an in-memory
// layer, typed errors, a ManagedRuntime built once — proving the pattern is
// framework-agnostic. The only SvelteKit-specific bit is `run`, which maps a
// typed failure onto SvelteKit's `error()` helper.

import { error } from '@sveltejs/kit'
import {
	Cause,
	Context,
	Data,
	Effect,
	Exit,
	Layer,
	ManagedRuntime,
	Option,
	Ref,
	Schema
} from 'effect'

// ---- Domain ----

export const Todo = Schema.Struct({
	id: Schema.Number,
	title: Schema.String,
	done: Schema.Boolean
})
export type Todo = typeof Todo.Type

export const CreateTodo = Schema.Struct({
	title: Schema.NonEmptyString
})

export class TodoNotFound extends Data.TaggedError('TodoNotFound')<{
	readonly id: number
}> {}

export class InvalidInput extends Data.TaggedError('InvalidInput')<{
	readonly message: string
}> {}

// ---- Service + in-memory layer ----

export class TodoRepo extends Context.Service<
	TodoRepo,
	{
		readonly list: () => Effect.Effect<ReadonlyArray<Todo>>
		readonly get: (id: number) => Effect.Effect<Todo, TodoNotFound>
		readonly create: (title: string) => Effect.Effect<Todo>
	}
>()('TodoRepo') {}

const TodoRepoMemory = Layer.effect(TodoRepo)(
	Effect.gen(function* () {
		const ref = yield* Ref.make({
			nextId: 3,
			todos: [
				{ id: 1, title: 'Learn Effect generators', done: true },
				{
					id: 2,
					title: 'Use Effect in a SvelteKit load',
					done: false
				}
			] as ReadonlyArray<Todo>
		})

		return TodoRepo.of({
			list: () => Effect.map(Ref.get(ref), (s) => s.todos),
			get: (id) =>
				Effect.flatMap(Ref.get(ref), (s) => {
					const todo = s.todos.find((t) => t.id === id)
					return todo
						? Effect.succeed(todo)
						: Effect.fail(new TodoNotFound({ id }))
				}),
			create: (title) =>
				Ref.modify(ref, (s) => {
					const todo: Todo = { id: s.nextId, title, done: false }
					return [
						todo,
						{ nextId: s.nextId + 1, todos: [...s.todos, todo] }
					]
				})
		})
	})
)

// ---- The bridge: build layers once, run a handler per request ----

const runtime = ManagedRuntime.make(TodoRepoMemory)

/**
 * Run a server Effect to a plain value for SvelteKit. Expected domain failures
 * become the right HTTP error via `error()`; an unexpected defect becomes a 500.
 */
export const run = async <A>(
	effect: Effect.Effect<A, TodoNotFound | InvalidInput, TodoRepo>
): Promise<A> => {
	const exit = await runtime.runPromiseExit(effect)
	if (Exit.isSuccess(exit)) return exit.value

	// A `fail` lands here as a typed error; a `die` (defect) does not.
	const failure = Option.getOrUndefined(
		Cause.findErrorOption(exit.cause)
	)
	if (failure?._tag === 'TodoNotFound') {
		throw error(404, `Todo ${failure.id} not found`)
	}
	if (failure?._tag === 'InvalidInput') {
		throw error(400, failure.message)
	}
	console.error('Unhandled defect:', exit.cause)
	throw error(500, 'Internal error')
}

/** Decode untrusted input into a typed value, or fail with InvalidInput. */
export const decode = <A>(
	schema: Schema.Codec<A>,
	input: unknown
): Effect.Effect<A, InvalidInput> =>
	Schema.decodeUnknownEffect(schema)(input).pipe(
		Effect.mapError(
			(issue) =>
				new InvalidInput({
					message: String(issue.message).split('\n')[0]!
				})
		)
	)
