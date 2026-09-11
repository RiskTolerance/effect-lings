# Mini Effect, one step at a time

A generator lets a program pause to request work. A driver runs that work
and sends the answer back, so the program can continue using it.

Each exercise adds one step:

1. **[Describe work](01-describe-work.ts)** — put a callback in an object without running it.
2. **[Run one request](02-run-one-request.ts)** — receive a request from `yield`, run it, and send the answer back with `.next(answer)`.
3. **[Chain requests](03-chain-requests.ts)** — use the first answer to request more work.
4. **[Build the driver](04-sync-driver.ts)** — repeat those steps in a loop until `done` is true.
5. **[Add async](05-async-driver.ts)** — let the driver wait for an answer before resuming.

Start with the first file; each lesson contains the explanation it needs.
All requests and answers use numbers to keep the types simple.

For arithmetic alone, ordinary function calls are simpler. This extra
machinery shows how a program can express its steps while a runtime controls
execution. The async lesson demonstrates that separation by adding waiting
in the driver.

Later, `Effect.gen` provides generator integration, and `yield*` delegates
to Effect values through JavaScript's iterable protocol. Our plain request
objects use `yield`. This toy only handles successful work; real Effect also
provides typed failures, services, cancellation, and resource management.
