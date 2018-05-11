import * as t from '$shared/ioTypes'
import * as assert from 'assert'
import {assertFailure, assertSuccess} from './testHelpers'

describe('union', () => {
  it('should succeed validating a valid value', () => {
    const T = t.union([t.string, t.number])
    assertSuccess(T.validate('s'))
    assertSuccess(T.validate(1))
  })

  it('should fail validating an invalid value', () => {
    const T = t.union([t.string, t.number])
    assertFailure(T.validate(true), [
      'Invalid value true supplied to : (string | number)/0: string',
      'Invalid value true supplied to : (string | number)/1: number',
    ])
  })

  it('should type guard', () => {
    const T1 = t.union([t.string, t.number])
    assert.strictEqual(T1.is(0), true)
    assert.strictEqual(T1.is('foo'), true)
    assert.strictEqual(T1.is(true), false)
  })
})
