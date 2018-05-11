import * as t from '$shared/ioTypes'
import * as assert from 'assert'
import {DateFromNumber, assertFailure, assertSuccess} from './testHelpers'

describe('union', () => {
  it('should succeed validating a valid value', () => {
    const T = t.union([t.string, t.number])
    assertSuccess(T.rootValidate('s'))
    assertSuccess(T.rootValidate(1))
  })

  it('should fail validating an invalid value', () => {
    const T = t.union([t.string, t.number])
    assertFailure(T.rootValidate(true), [
      'Invalid value true supplied to : (string | number)/0: string',
      'Invalid value true supplied to : (string | number)/1: number',
    ])
  })

  it('should return the same reference when serializing', () => {
    const T = t.union([t.type({a: t.number}), t.string])
    assert.strictEqual(T.encode, t.identity)
  })

  it('should type guard', () => {
    const T1 = t.union([t.string, t.number])
    assert.strictEqual(T1.is(0), true)
    assert.strictEqual(T1.is('foo'), true)
    assert.strictEqual(T1.is(true), false)
    const T2 = t.union([t.string, DateFromNumber])
    assert.strictEqual(T2.is(new Date(0)), true)
    assert.strictEqual(T2.is('foo'), true)
    assert.strictEqual(T2.is(true), false)
  })
})
