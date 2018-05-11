import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import {assertSuccess, assertFailure, DateFromNumber} from './testHelpers'

describe('array', () => {
  it('should succeed validating a valid value', () => {
    const T = t.array(t.number)
    assertSuccess(T.rootValidate([]))
    assertSuccess(T.rootValidate([1, 2, 3]))
  })

  it('should fail validating an invalid value', () => {
    const T = t.array(t.number)
    assertFailure(T.rootValidate(1), [
      'Invalid value 1 supplied to : Array<number>',
    ])
    assertFailure(T.rootValidate([1, 's', 3]), [
      'Invalid value "s" supplied to : Array<number>/1: number',
    ])
  })

  it('should type guard', () => {
    const T1 = t.array(t.number)
    assert.strictEqual(T1.is([]), true)
    assert.strictEqual(T1.is([0]), true)
    assert.strictEqual(T1.is([0, 'foo']), false)
    const T2 = t.array(DateFromNumber)
    assert.strictEqual(T2.is([]), true)
    assert.strictEqual(T2.is([new Date(0)]), true)
    assert.strictEqual(T2.is([new Date(0), 0]), false)
  })
})
