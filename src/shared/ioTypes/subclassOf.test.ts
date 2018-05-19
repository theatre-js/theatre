import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import {assertSuccess, assertFailure} from './testHelpers'

class A {a: true}
class A2 extends A {}
class B {b: true}

describe('instanceOf', () => {
  it('should succeed validating a valid value', () => {
    const T = t.subclassOf(A)
    assertSuccess(T.validate(A))
    assertSuccess(T.validate(A2))
  })

  it('should fail validating an invalid value', () => {
    const T = t.subclassOf(A)

    assertFailure(T.validate(B), [
      'Invalid value B supplied to : subclassOf<A>',
    ])
  })

  it('should type guard', () => {
    const T = t.subclassOf(A)

    assert.strictEqual(T.is(A), true)
    assert.strictEqual(T.is(A2), true)
    assert.strictEqual(T.is(B), false)
    assert.strictEqual(T.is(undefined), false)
  })
})
