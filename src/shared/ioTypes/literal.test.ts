import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import {assertSuccess, assertFailure} from './testHelpers'

describe('literal', () => {
  it('should succeed validating a valid value', () => {
    const T = t.literal('a')
    assertSuccess(T.validate('a'))
  })

  it('should fail validating an invalid value', () => {
    const T = t.literal('a')
    assertFailure(T.validate(1), ['Invalid value 1 supplied to : "a"'])
  })

  it('should type guard', () => {
    const T = t.literal('a')
    assert.strictEqual(T.is('a'), true)
    assert.strictEqual(T.is('b'), false)
    assert.strictEqual(T.is(undefined), false)
  })
})
