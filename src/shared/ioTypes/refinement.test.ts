import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure, assertStrictEqual, DateFromNumber, IntegerFromString } from './testHelpers'

describe('refinement', () => {
  it('should succeed validating a valid value', () => {
    const T = t.refinement(t.number, n => n >= 0)
    assertSuccess(T.decode(0))
    assertSuccess(T.decode(1))
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.refinement(t.Dictionary, () => true)
    const value = {}
    assertStrictEqual(T.decode(value), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.Integer
    assertFailure(T.decode('a'), ['Invalid value "a" supplied to : Integer'])
    assertFailure(T.decode(1.2), ['Invalid value 1.2 supplied to : Integer'])
  })

  it('should fail with the last deserialized value', () => {
    const T = IntegerFromString
    assertFailure(T.decode('a'), ['Invalid value "a" supplied to : IntegerFromString'])
    assertFailure(T.decode('1.2'), ['Invalid value 1.2 supplied to : IntegerFromString'])
  })

  it('should serialize a deserialized', () => {
    const T = t.refinement(t.array(DateFromNumber), () => true)
    assert.deepEqual(T.encode([new Date(0)]), [0])
  })

  it('should return the same reference when serializing', () => {
    const T = t.refinement(t.array(t.number), () => true)
    assert.strictEqual(T.encode, t.identity)
  })

  it('should type guard', () => {
    const T = t.Integer
    assert.strictEqual(T.is(1.2), false)
    assert.strictEqual(T.is('a'), false)
    assert.strictEqual(T.is(1), true)
  })
})
