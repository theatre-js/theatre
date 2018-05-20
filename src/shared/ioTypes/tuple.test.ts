import * as t from '$shared/ioTypes'
import * as assert from 'assert'
import {assertFailure, assertSuccess} from './testHelpers'

describe('tuple', () => {
  it('should succeed validating a valid value', () => {
    const T = t.tuple([t.number, t.string])
    assertSuccess(T.validate([1, 'a']))
  })

  it('should fail validating an invalid value', () => {
    const T = t.tuple([t.number, t.string])
    assertFailure(T.validate([]), [
      'Invalid value undefined supplied to : [number, string]/[0]: number',
      'Invalid value undefined supplied to : [number, string]/[1]: string',
    ])
    assertFailure(T.validate([1]), [
      'Invalid value undefined supplied to : [number, string]/[1]: string',
    ])
    assertFailure(T.validate([1, 1]), [
      'Invalid value 1 supplied to : [number, string]/[1]: string',
    ])
    assertFailure(T.validate([1, 'foo', true]), [
      'Invalid value true supplied to : [number, string]/[2]: never',
    ])
  })

  it('should type guard', () => {
    const T1 = t.tuple([t.number, t.string])
    assert.strictEqual(T1.is([0, 'foo']), true)
    assert.strictEqual(T1.is([0, 2]), false)
    assert.strictEqual(T1.is(undefined), false)
    assert.strictEqual(T1.is([0]), false)
    assert.strictEqual(T1.is([0, 'foo', true]), false)
  })
})
