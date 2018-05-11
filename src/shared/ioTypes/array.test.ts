import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, DateFromNumber } from './testHelpers'

describe('array', () => {
  it('should succeed validating a valid value', () => {
    const T = t.array(t.number)
    assertSuccess(T.decode([]))
    assertSuccess(T.decode([1, 2, 3]))
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.array(t.number)
    const value = [1, 2, 3]
    assertStrictEqual(T.decode(value), value)
  })

  it('should return a new reference if validation succeeded and something changed', () => {
    const T = t.array(DateFromNumber)
    assertDeepEqual(T.decode([1, 2, 3]), [new Date(1), new Date(2), new Date(3)])
  })

  it('should fail validating an invalid value', () => {
    const T = t.array(t.number)
    assertFailure(T.decode(1), ['Invalid value 1 supplied to : Array<number>'])
    assertFailure(T.decode([1, 's', 3]), ['Invalid value "s" supplied to : Array<number>/1: number'])
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
