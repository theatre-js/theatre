// @flow
import {type RunSagaFn} from './withRunSaga'

describe('withRunSaga()', () => {
  it('should work')

  /* eslint-disable no-unused-vars */
  async function typeTests(){
    declare var run: RunSagaFn
    function* foo(a: string, b: number): Generator<*, boolean, *> {
      yield null
      return false
    }

    // $FlowExpectError
    run(foo)

    // $FlowExpectError
    run(foo, 'foo')

    run(foo, 'foo', 10)


    const a: boolean = await run(foo, 'h', 1)

    // $FlowExpectError
    const b: string = await run(foo, 'h', 1)
  }
})