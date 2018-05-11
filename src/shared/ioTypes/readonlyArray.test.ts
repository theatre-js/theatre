import * as t from '$shared/ioTypes'
import * as assert from 'assert'
import {assertFailure, assertSuccess} from './testHelpers'

describe('readonlyArray', () => {
  it('should succeed validating a valid value', () => {
    const T = t.readonlyArray(t.number)
    assertSuccess(T.validate([1]))
  })

  it('should fail validating an invalid value', () => {
    const T = t.readonlyArray(t.number)
    assertFailure(T.validate(['s']), [
      'Invalid value "s" supplied to : ReadonlyArray<number>/0: number',
    ])
  })

  it('should freeze the value', () => {
    const T = t.readonlyArray(t.number)
    T.validate([1]).map(x => assert.ok(Object.isFrozen(x)))
  })

  it('should type guard', () => {
    const T1 = t.readonlyArray(t.number)
    assert.strictEqual(T1.is([]), true)
    assert.strictEqual(T1.is([0]), true)
    assert.strictEqual(T1.is([0, 'foo']), false)
    assert.strictEqual(T1.is(undefined), false)
  })
})
