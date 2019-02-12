import {RunSagaFn} from './withRunSaga'

describe('withRunSaga()', () => {
  /* eslint-disable no-unused-vars */
  async function typeTests() {
    const run: RunSagaFn = null as $IntentionalAny
    function* foo(a: string, b: number): Generator_<boolean> {
      yield null
      return false
    }

    // $ExpectError
    run(foo)

    // $ExpectError
    run(foo, 'foo')

    run(foo, 'foo', 10)

    const a: boolean = await run(foo, 'h', 1)

    const b: string = await run(foo, 'h', 1)
  }
})
