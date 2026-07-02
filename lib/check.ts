// A deliberately tiny check helper. No test framework — fewer deps means a
// faster `bun install` and less friction the day you actually sit down.
//
// An exercise "passes" when this file runs to the end without throwing.
// A failed check throws, Bun exits non-zero, and the runner shows you why.

let passed = 0

function show(value: unknown): string {
	if (typeof value === 'string') return JSON.stringify(value)
	if (Array.isArray(value)) return `[${value.map(show).join(', ')}]`
	return String(value)
}

function equal(a: unknown, b: unknown): boolean {
	if (Array.isArray(a) && Array.isArray(b)) {
		return a.length === b.length && a.every((x, i) => equal(x, b[i]))
	}
	return Object.is(a, b)
}

function fail(message: string): never {
	console.error(`\n${message}\n`)
	process.exit(1)
}

/** Assert that `actual` deep-equals `expected`. */
export function check(
	label: string,
	actual: unknown,
	expected: unknown
): void {
	if (!equal(actual, expected)) {
		fail(
			`❌  ${label}\n     expected: ${show(expected)}\n     received: ${show(actual)}`
		)
	}
	passed++
	console.log(`  ✓ ${label}`)
}

/** Assert that `fn` throws. Optionally match part of the message. */
export function checkThrows(
	label: string,
	fn: () => unknown,
	contains?: string
): void {
	try {
		fn()
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err)
		if (contains && !msg.includes(contains)) {
			fail(
				`❌  ${label}\n     threw, but message did not contain ${show(contains)}\n     got: ${msg}`
			)
		}
		passed++
		console.log(`  ✓ ${label}`)
		return
	}
	fail(
		`❌  ${label}\n     expected the code to throw, but it did not`
	)
}

/** Call once at the top of an exercise to print its name. */
export function section(name: string): void {
	console.log(`\n${name}`)
}

// Print a summary on clean exit so a pass is unambiguous.
process.on('exit', (code) => {
	if (code === 0 && passed > 0) {
		console.log(`\n✅  all ${passed} checks passed\n`)
	}
})
