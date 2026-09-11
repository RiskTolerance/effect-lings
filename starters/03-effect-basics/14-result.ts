import { Effect, Result } from 'effect'
import { check, section } from '../../lib/check'
section('result preserves the outcome as data you can inspect.')

// Effect.result moves an expected failure into the success value.
// That value is a Result: either Success with .success or Failure with .failure.
// Check Result.isFailure before reading .failure. The checks show both cases;
// your task is only to capture the outcome, without replacing its contents.

const positive = (n: number): Effect.Effect<number, string> =>
	n > 0 ? Effect.succeed(n) : Effect.fail('not positive')

// 📝 TODO: wrap positive(n) in Effect.result.
const capture = (
	n: number
): Effect.Effect<Result.Result<number, string>> =>
	Effect.result(Effect.succeed(0))

// ---- checks (don't edit) ----
const failed = Effect.runSync(capture(-2))
check('a failure is captured', Result.isFailure(failed), true)
check(
	'the error is preserved',
	Result.isFailure(failed) ? failed.failure : null,
	'not positive'
)
const succeeded = Effect.runSync(capture(7))
check('a success is captured', Result.isSuccess(succeeded), true)
check(
	'the value is preserved',
	Result.isSuccess(succeeded) ? succeeded.success : null,
	7
)
