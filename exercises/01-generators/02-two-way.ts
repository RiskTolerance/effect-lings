import { check, section } from '../../lib/check'
section('The trick: .next(value) PASSES a value back in.')
section('`const x = yield q` hands q OUT, and .next(v) makes v become x.')

// 📝 TODO: yield two prompts, capture the two numbers fed back via .next(),
//          and return `sum is <a+b>`. Note the third Generator type param is
//          the type of what gets fed back IN.
function* conversation(): Generator<string, string, number> {
  const a = yield 'give me a number'
  const b = yield 'give me another'
  return `sum is ${a + b}`
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
