import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure, assertStrictEqual, DateFromNumber } from './testHelpers'

describe('union', () => {
  it('should succeed validating a valid value', () => {
    const T = t.union([t.string, t.number])
    assertSuccess(T.decode('s'))
    assertSuccess(T.decode(1))
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.union([t.Dictionary, t.number])
    const value = {}
    assertStrictEqual(T.decode(value), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.union([t.string, t.number])
    assertFailure(T.decode(true), [
      'Invalid value true supplied to : (string | number)/0: string',
      'Invalid value true supplied to : (string | number)/1: number'
    ])
  })

  it('should serialize a deserialized', () => {
    const T1 = t.union([t.interface({ a: DateFromNumber }), t.number])
    assert.deepEqual(T1.encode({ a: new Date(0) }), { a: 0 })
    assert.deepEqual(T1.encode(1), 1)
    const T2 = t.union([t.number, DateFromNumber])
    assert.deepEqual(T2.encode(new Date(0)), 0)
  })

  it('should return the same reference when serializing', () => {
    const T = t.union([t.type({ a: t.number }), t.string])
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
