import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import {
  assertSuccess,
  assertFailure,
  assertStrictEqual,
  DateFromNumber,
  assertDeepEqual,
  withDefault
} from './testHelpers'

describe('partial', () => {
  it('should succeed validating a valid value', () => {
    const T = t.partial({ a: t.number })
    assertSuccess(T.decode({}))
    assertSuccess(T.decode({ a: 1 }))
  })

  it('should not add optional keys', () => {
    const T = t.partial({ a: t.number })
    assert.strictEqual(
      T.decode({})
        .fold<any>(t.identity, t.identity)
        .hasOwnProperty('a'),
      false
    )
    assert.strictEqual(
      T.decode({ b: 1 })
        .fold<any>(t.identity, t.identity)
        .hasOwnProperty('a'),
      false
    )
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.partial({ a: t.number })
    const value = {}
    assertStrictEqual(T.decode(value), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.partial({ a: t.number })
    assertFailure(T.decode({ a: 's' }), [
      'Invalid value "s" supplied to : PartialType<{ a: number }>/a: (number | undefined)/0: number',
      'Invalid value "s" supplied to : PartialType<{ a: number }>/a: (number | undefined)/1: undefined'
    ])
  })

  it('should type guard', () => {
    const T1 = t.partial({ a: t.number })
    assert.strictEqual(T1.is({}), true)
    assert.strictEqual(T1.is({ a: 1 }), true)
    assert.strictEqual(T1.is({ a: 'foo' }), false)
    assert.strictEqual(T1.is(undefined), false)
    const T2 = t.partial({ a: DateFromNumber })
    assert.strictEqual(T2.is({}), true)
    assert.strictEqual(T2.is({ a: new Date(0) }), true)
    assert.strictEqual(T2.is({ a: 0 }), false)
    assert.strictEqual(T2.is(undefined), false)
  })

  it('should support default values', () => {
    const T = t.partial({
      name: withDefault(t.string, 'foo')
    })
    assertDeepEqual(T.decode({}), { name: 'foo' })
  })
})
