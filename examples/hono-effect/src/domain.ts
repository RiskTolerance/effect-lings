// The domain layer: what a Todo *is*, the typed failures the app can produce,
// and the schemas that validate untrusted input at the edge.
//
// Nothing here knows about HTTP or Hono. That separation is the whole point —
// the business rules are plain Effect values you could run from a test, a CLI,
// or a queue worker without touching this file.

import { Data, Schema } from 'effect'

// ---- Entities ----

export const Todo = Schema.Struct({
	id: Schema.Number,
	title: Schema.String,
	done: Schema.Boolean
})
export type Todo = typeof Todo.Type

// ---- Request payloads (what clients are allowed to send) ----
// Decoding these turns `unknown` JSON into a typed value *or* a Schema failure.

export const CreateTodo = Schema.Struct({
	title: Schema.NonEmptyString
})
export type CreateTodo = typeof CreateTodo.Type

export const UpdateTodo = Schema.Struct({
	title: Schema.optional(Schema.NonEmptyString),
	done: Schema.optional(Schema.Boolean)
})
export type UpdateTodo = typeof UpdateTodo.Type

// ---- Typed errors ----
// These live in the Effect's E channel, so a handler that can fail with
// `TodoNotFound` says so in its type and the compiler forces you to handle it.

export class TodoNotFound extends Data.TaggedError('TodoNotFound')<{
	readonly id: number
}> {}

export class InvalidInput extends Data.TaggedError('InvalidInput')<{
	readonly message: string
}> {}
