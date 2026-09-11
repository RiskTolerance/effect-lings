import { check, section } from '../../lib/check'
section('Describe work now. Run it later.')

// A work request is just an object holding a callback.
// Creating the object must NOT execute the callback.
// This lets another piece of code decide when the work happens.
type Op = { run: () => number }

// 📝 TODO: return an object containing the callback, without calling it.
function sync(callback: () => number): Op {
	throw new Error('TODO: implement sync')
}

// ---- checks (don't edit) ----
let calls = 0
const request = sync(() => {
	calls++
	return 2
})
check('describing work does not run it', calls, 0)
check('running the request produces its answer', request.run(), 2)
check('the callback ran once', calls, 1)
