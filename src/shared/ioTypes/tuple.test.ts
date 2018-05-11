import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, DateFromNumber } from './testHelpers'

describe('tuple', () => {
  it('should succeed validating a valid value', () => {
    const T = t.tuple([t.number, t.string])
    assertSuccess(T.decode([1, 'a']))
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.tuple([t.number, t.string])
    const value = [1, 'a']
    assertStrictEqual(T.decode(value), value)
  })

  it('should return the a new reference if validation succeeded and something changed', () => {
    const T = t.tuple([DateFromNumber, t.string])
    assertDeepEqual(T.decode([1, 'a']), [new Date(1), 'a'])
  })

  it('should fail validating an invalid value', () => {
    const T = t.tuple([t.number, t.string])
    assertFailure(T.decode([]), [
      'Invalid value undefined supplied to : [number, string]/0: number',
      'Invalid value undefined supplied to : [number, string]/1: string'
    ])
    assertFailure(T.decode([1]), ['Invalid value undefined supplied to : [number, string]/1: string'])
    assertFailure(T.decode([1, 1]), ['Invalid value 1 supplied to : [number, string]/1: string'])
    assertFailure(T.decode([1, 'foo', true]), ['Invalid value true supplied to : [number, string]/2: never'])
  })

  it('should serialize a deserialized', () => {
    const T = t.tuple([DateFromNumber, t.string])
    assert.deepEqual(T.encode([new Date(0), 'foo']), [0, 'foo'])
  })

  it('should return the same reference when serializing', () => {
    const T = t.tuple([t.number, t.string])
    assert.strictEqual(T.encode, t.identity)
  })

  it('should type guard', () => {
    const T1 = t.tuple([t.number, t.string])
    assert.strictEqual(T1.is([0, 'foo']), true)
    assert.strictEqual(T1.is([0, 2]), false)
    assert.strictEqual(T1.is(undefined), false)
    assert.strictEqual(T1.is([0]), false)
    assert.strictEqual(T1.is([0, 'foo', true]), false)
    const T2 = t.tuple([DateFromNumber, t.string])
    assert.strictEqual(T2.is([new Date(0), 'foo']), true)
    assert.strictEqual(T2.is([new Date(0), 2]), false)
    assert.strictEqual(T2.is(undefined), false)
    assert.strictEqual(T2.is([new Date(0)]), false)
    assert.strictEqual(T2.is([new Date(0), 'foo', true]), false)
  })
})
