import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import {assertSuccess, assertFailure} from './testHelpers'

class A {a: true}
class B {b: true}

describe('instanceOf', () => {
  it('should succeed validating a valid value', () => {
    const T = t.instanceOf(A)
    assertSuccess(T.validate(new A))
  })

  it('should fail validating an invalid value', () => {
    const T = t.instanceOf(A)

    assertFailure(T.validate(new B), [
      'Invalid value {} supplied to : instanceOf<A>',
    ])
  })

  it('should type guard', () => {
    const T = t.instanceOf(A)

    assert.strictEqual(T.is(new A), true)
    assert.strictEqual(T.is({}), false)
    assert.strictEqual(T.is(new B), false)
  })
})
