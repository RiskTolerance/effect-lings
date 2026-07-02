// The HTTP layer. Each handler is an Effect that produces a Response and has
// already caught every expected failure (TodoNotFound, InvalidInput) into the
// right status code — so its error channel ends up `never` and `toResponse`
// just has to run it.
//
// Read one handler top to bottom and the shape repeats everywhere:
//   gen { decode input → call the repo → shape a Response }.pipe(catchTags…)

import { Effect, Schema } from 'effect'
import { Hono } from 'hono'
import {
	CreateTodo,
	InvalidInput,
	TodoNotFound,
	UpdateTodo
} from './domain.ts'
import { TodoRepo } from './repo.ts'
import { toResponse } from './runtime.ts'

// Decode untrusted input, turning a Schema failure into our own typed
// InvalidInput error (which catchTags then maps to a 400). This is the single
// choke point where `unknown` becomes a trusted, typed value.
const decode = <A>(
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

// Map every expected domain error to an HTTP Response. After this, the Effect
// can no longer fail — exactly the contract `toResponse` expects.
const handleErrors = <R>(
	self: Effect.Effect<Response, TodoNotFound | InvalidInput, R>
): Effect.Effect<Response, never, R> =>
	self.pipe(
		Effect.catchTags({
			TodoNotFound: (e) =>
				Effect.succeed(
					Response.json(
						{ error: 'TodoNotFound', id: e.id },
						{ status: 404 }
					)
				),
			InvalidInput: (e) =>
				Effect.succeed(
					Response.json(
						{ error: 'InvalidInput', message: e.message },
						{ status: 400 }
					)
				)
		})
	)

const parseId = (raw: string) =>
	/^\d+$/.test(raw)
		? Effect.succeed(Number(raw))
		: Effect.fail(
				new InvalidInput({ message: `"${raw}" is not a valid id` })
			)

export const app = new Hono()

app.get('/health', (c) => c.json({ ok: true }))

// GET /todos — list all
app.get('/todos', (c) =>
	toResponse(
		Effect.gen(function* () {
			const repo = yield* TodoRepo
			const todos = yield* repo.list()
			return Response.json(todos)
		}).pipe(handleErrors)
	)
)

// GET /todos/:id — one, or 404
app.get('/todos/:id', (c) =>
	toResponse(
		Effect.gen(function* () {
			const repo = yield* TodoRepo
			const id = yield* parseId(c.req.param('id'))
			const todo = yield* repo.get(id)
			return Response.json(todo)
		}).pipe(handleErrors)
	)
)

// POST /todos — validate body, create, 201
app.post('/todos', (c) =>
	toResponse(
		Effect.gen(function* () {
			const repo = yield* TodoRepo
			const body = yield* Effect.promise(() =>
				c.req.json().catch(() => null)
			)
			const input = yield* decode(CreateTodo, body)
			const todo = yield* repo.create(input)
			return Response.json(todo, { status: 201 })
		}).pipe(handleErrors)
	)
)

// PATCH /todos/:id — validate body, update, or 404
app.patch('/todos/:id', (c) =>
	toResponse(
		Effect.gen(function* () {
			const repo = yield* TodoRepo
			const id = yield* parseId(c.req.param('id'))
			const body = yield* Effect.promise(() =>
				c.req.json().catch(() => null)
			)
			const input = yield* decode(UpdateTodo, body)
			const todo = yield* repo.update(id, input)
			return Response.json(todo)
		}).pipe(handleErrors)
	)
)

// DELETE /todos/:id — remove, or 404
app.delete('/todos/:id', (c) =>
	toResponse(
		Effect.gen(function* () {
			const repo = yield* TodoRepo
			const id = yield* parseId(c.req.param('id'))
			yield* repo.remove(id)
			return new Response(null, { status: 204 })
		}).pipe(handleErrors)
	)
)
