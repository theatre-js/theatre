import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import {assertSuccess, assertFailure} from './testHelpers'

describe('array', () => {
  it('should succeed validating a valid value', () => {
    const T = t.array(t.number)
    assertSuccess(T.validate([]))
    assertSuccess(T.validate([1, 2, 3]))
  })

  it('should fail validating an invalid value', () => {
    const T = t.array(t.number)
    assertFailure(T.validate(1), [
      'Invalid value 1 supplied to : Array<number>',
    ])
    assertFailure(T.validate([1, 's', 3]), [
      'Invalid value "s" supplied to : Array<number>/1: number',
    ])
  })

  it('should type guard', () => {
    const T1 = t.array(t.number)
    assert.strictEqual(T1.is([]), true)
    assert.strictEqual(T1.is([0]), true)
    assert.strictEqual(T1.is([0, 'foo']), false)
  })
})
