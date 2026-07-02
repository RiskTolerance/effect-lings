// Entry point. Bun looks for a default export with a `fetch` method and serves
// it — a Hono app is exactly that. The Effect runtime (and its in-memory store)
// is built once, when runtime.ts is first imported, and shared across requests.

import { app } from './routes.ts'

const port = Number(process.env.PORT ?? 3000)

console.log(`🚀  hono-effect listening on http://localhost:${port}`)
console.log(`    try:  curl http://localhost:${port}/todos`)

export default {
	port,
	fetch: app.fetch
}
