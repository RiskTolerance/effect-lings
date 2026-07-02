import { check, section } from '../../lib/check'
section('The trick: .next(value) PASSES a value back in.')
section('`const x = yield q` hands q OUT, and .next(v) makes v become x.')

// Before you start:
// - Mental model: `yield` is a two-way pause. It sends a value out, then waits.
//   The next `.next(value)` call resumes the generator, and that `value`
//   becomes the result of the paused `yield` expression.
// - Shape to look for: yield a question, receive a number, yield another
//   question, receive another number, then return the computed string.
// - Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator/next

// 📝 TODO: yield two prompts, capture the two numbers fed back via .next(),
//          and return `sum is <a+b>`. Note the third Generator type param is
//          the type of what gets fed back IN.
function* conversation(): Generator<string, string, number> {
  let a = yield 'give me a number'
  let b = yield 'give me another'
  return `sum is ${a + b}` // fix me
}

// ---- checks (don't edit) ----
const it = conversation()
const q1 = it.next()
const q2 = it.next(10) // 10 becomes the result of the first yield
const done = it.next(5) // 5 becomes the result of the second yield

check('first yield asks', q1.value, 'give me a number')
check('second yield asks', q2.value, 'give me another')
check('return uses fed-in values', done.value, 'sum is 15')
check('generator is done', done.done, true)
