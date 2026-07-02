// The TodoRepo *service*: an interface in the Context, plus an in-memory
// implementation provided as a Layer. Swap `TodoRepoMemory` for a SQL-backed
// layer later and not one line of the HTTP layer changes — that's the payoff
// of programming against the service key instead of a concrete class.

import { Context, Effect, Layer, Ref } from 'effect'
import {
	type CreateTodo,
	type Todo,
	TodoNotFound,
	type UpdateTodo
} from './domain.ts'

// `Context.Service<Self, Shape>()("Key")` is the v4 way to declare a service.
// Yielding `TodoRepo` inside an Effect.gen pulls the implementation out of the
// surrounding context (and records the requirement in the Effect's R channel).
export class TodoRepo extends Context.Service<
	TodoRepo,
	{
		readonly list: () => Effect.Effect<ReadonlyArray<Todo>>
		readonly get: (id: number) => Effect.Effect<Todo, TodoNotFound>
		readonly create: (input: CreateTodo) => Effect.Effect<Todo>
		readonly update: (
			id: number,
			input: UpdateTodo
		) => Effect.Effect<Todo, TodoNotFound>
		readonly remove: (id: number) => Effect.Effect<void, TodoNotFound>
	}
>()('TodoRepo') {}

type State = {
	readonly nextId: number
	readonly todos: ReadonlyArray<Todo>
}

// A scoped, effectful layer: it allocates a Ref when the layer is built and
// closes over it. Every request shares this one store for the process lifetime.
export const TodoRepoMemory = Layer.effect(TodoRepo)(
	Effect.gen(function* () {
		const ref = yield* Ref.make<State>({
			nextId: 3,
			todos: [
				{ id: 1, title: 'Learn Effect generators', done: true },
				{ id: 2, title: 'Wire Effect into Hono', done: false }
			]
		})

		const find = (id: number) =>
			Ref.get(ref).pipe(
				Effect.flatMap((s) => {
					const todo = s.todos.find((t) => t.id === id)
					return todo
						? Effect.succeed(todo)
						: Effect.fail(new TodoNotFound({ id }))
				})
			)

		return TodoRepo.of({
			list: () => Effect.map(Ref.get(ref), (s) => s.todos),

			get: find,

			create: (input) =>
				Ref.modify(ref, (s) => {
					const todo: Todo = {
						id: s.nextId,
						title: input.title,
						done: false
					}
					return [
						todo,
						{ nextId: s.nextId + 1, todos: [...s.todos, todo] }
					]
				}),

			update: (id, input) =>
				find(id).pipe(
					Effect.flatMap((existing) => {
						const updated: Todo = {
							...existing,
							...(input.title !== undefined
								? { title: input.title }
								: {}),
							...(input.done !== undefined
								? { done: input.done }
								: {})
						}
						return Ref.update(ref, (s) => ({
							...s,
							todos: s.todos.map((t) => (t.id === id ? updated : t))
						})).pipe(Effect.as(updated))
					})
				),

			remove: (id) =>
				find(id).pipe(
					Effect.flatMap(() =>
						Ref.update(ref, (s) => ({
							...s,
							todos: s.todos.filter((t) => t.id !== id)
						}))
					)
				)
		})
	})
)
