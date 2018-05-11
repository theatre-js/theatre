import * as t from '$shared/ioTypes'
import * as assert from 'assert'
import {
  assertFailure,
  assertSuccess,
} from './testHelpers'

describe('refinement', () => {
  it('should succeed validating a valid value', () => {
    const T = t.refinement(t.number, n => n >= 0)
    assertSuccess(T.validate(0))
    assertSuccess(T.validate(1))
  })

  it('should fail validating an invalid value', () => {
    const T = t.Integer
    assertFailure(T.validate('a'), ['Invalid value "a" supplied to : Integer'])
    assertFailure(T.validate(1.2), ['Invalid value 1.2 supplied to : Integer'])
  })

  it('should type guard', () => {
    const T = t.Integer
    assert.strictEqual(T.is(1.2), false)
    assert.strictEqual(T.is('a'), false)
    assert.strictEqual(T.is(1), true)
  })
})
