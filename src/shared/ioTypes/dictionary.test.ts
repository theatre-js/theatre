import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, string2, DateFromNumber } from './testHelpers'

describe('dictionary', () => {
  it('should succeed validating a valid value', () => {
    const T1 = t.dictionary(t.string, t.number)
    assertSuccess(T1.decode({}))
    assertSuccess(T1.decode({ aa: 1 }))
    const T2 = t.dictionary(t.refinement(t.string, s => s.length >= 2), t.number)
    assertSuccess(T2.decode({}))
    assertSuccess(T2.decode({ aa: 1 }))
    const T3 = t.dictionary(string2, t.number)
    assertSuccess(T3.decode({}))
    assertSuccess(T3.decode({ aa: 1 }))
  })

  it('should return the same reference if validation succeeded if nothing changed', () => {
    const T1 = t.dictionary(t.string, t.number)
    const value1 = { aa: 1 }
    assertStrictEqual(T1.decode(value1), value1)
    const T2 = t.dictionary(t.refinement(t.string, s => s.length >= 2), t.number)
    const value2 = { aa: 1 }
    assertStrictEqual(T2.decode(value2), value2)
  })

  it('should return a new reference if validation succeeded and something changed', () => {
    const T = t.dictionary(string2, t.number)
    const value = { aa: 1 }
    assertDeepEqual(T.decode(value), { 'a-a': 1 })
  })

  it('should fail validating an invalid value', () => {
    const T = t.dictionary(t.string, t.number)
    assertFailure(T.decode({ aa: 's' }), ['Invalid value "s" supplied to : { [K in string]: number }/aa: number'])
  })

  it('should support literals as domain type', () => {
    const T = t.dictionary(t.literal('foo'), t.string)
    assertSuccess(T.decode({ foo: 'bar' }))
    assertFailure(T.decode({ foo: 'bar', baz: 'bob' }), [
      'Invalid value "baz" supplied to : { [K in "foo"]: string }/baz: "foo"'
    ])
  })

  it('should support keyof as domain type', () => {
    const T = t.dictionary(t.keyof({ foo: true, bar: true }), t.string)
    assertSuccess(T.decode({ foo: 'bar' }))
    assertFailure(T.decode({ foo: 'bar', baz: 'bob' }), [
      'Invalid value "baz" supplied to : { [K in (keyof ["foo","bar"])]: string }/baz: (keyof ["foo","bar"])'
    ])
  })

  it('should type guard', () => {
    const T1 = t.dictionary(t.string, t.number)
    assert.strictEqual(T1.is({}), true)
    assert.strictEqual(T1.is({ a: 1 }), true)
    assert.strictEqual(T1.is({ a: 'foo' }), false)
    const T2 = t.dictionary(t.string, DateFromNumber)
    assert.strictEqual(T2.is({}), true)
    assert.strictEqual(T2.is({ a: new Date(0) }), true)
    assert.strictEqual(T2.is({ a: 0 }), false)
    const T3 = t.dictionary(string2, t.number)
    assert.strictEqual(T3.is({}), true)
    assert.strictEqual(T3.is({ 'a-a': 1 }), true)
    assert.strictEqual(T3.is({ aa: 1 }), false)
  })
})
