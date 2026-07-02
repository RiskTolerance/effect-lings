// The page `load` runs an Effect to fetch data, and a form action runs another
// to create a todo. Both go through the same `run` bridge — so a TodoNotFound
// or InvalidInput from the Effect becomes a real HTTP error / 400, with the
// route code reading like plain async/await.

import { Effect } from 'effect'
import { fail } from '@sveltejs/kit'
import { CreateTodo, decode, run, TodoRepo } from '$lib/server/todos'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const todos = await run(
		Effect.gen(function* () {
			const repo = yield* TodoRepo
			return yield* repo.list()
		})
	)
	return { todos }
}

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData()
		const title = form.get('title')

		// Validate with Schema inside Effect; on InvalidInput, surface a form error
		// instead of a 400 page (nicer UX for a form submit).
		const exit = await run(
			Effect.gen(function* () {
				const repo = yield* TodoRepo
				const input = yield* decode(CreateTodo, { title })
				return yield* repo.create(input.title)
			}).pipe(
				Effect.catchTag('InvalidInput', (e) =>
					Effect.succeed({
						_form: 'error' as const,
						message: e.message
					})
				)
			)
		)

		if ('_form' in exit) return fail(400, { message: exit.message })
		return { created: exit }
	}
}
