import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure, assertStrictEqual, DateFromNumber } from './testHelpers'
import * as assert from 'assert'

describe('strict', () => {
  it('should succeed validating a valid value', () => {
    const T = t.strict({ foo: t.string })
    assertSuccess(T.decode({ foo: 'foo' }))
  })

  it('should succeed validating an undefined field', () => {
    const T = t.strict({ foo: t.string, bar: t.union([t.string, t.undefined]) })
    assertSuccess(T.decode({ foo: 'foo' }))
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.strict({ foo: t.string })
    const value = { foo: 'foo' }
    assertStrictEqual(T.decode(value), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.strict({ foo: t.string })
    assertFailure(T.decode({ foo: 'foo', bar: 1, baz: true }), [
      'Invalid value 1 supplied to : StrictType<{ foo: string }>/bar: never',
      'Invalid value true supplied to : StrictType<{ foo: string }>/baz: never'
    ])
  })

  it('should assign a default name', () => {
    const T1 = t.strict({ foo: t.string }, 'Foo')
    assert.strictEqual(T1.name, 'Foo')
    const T2 = t.strict({ foo: t.string })
    assert.strictEqual(T2.name, 'StrictType<{ foo: string }>')
  })

  it('should serialize a deserialized', () => {
    const T = t.strict({ a: DateFromNumber })
    assert.deepEqual(T.encode({ a: new Date(0) }), { a: 0 })
  })

  it('should return the same reference when serializing', () => {
    const T = t.strict({ a: t.number })
    assert.strictEqual(T.encode, t.identity)
  })

  it('should type guard', () => {
    const T1 = t.strict({ a: t.number })
    assert.strictEqual(T1.is({ a: 0 }), true)
    assert.strictEqual(T1.is({ a: 0, b: 1 }), false)
    assert.strictEqual(T1.is(undefined), false)
    const T2 = t.strict({ a: DateFromNumber })
    assert.strictEqual(T2.is({ a: new Date(0) }), true)
    assert.strictEqual(T2.is({ a: new Date(0), b: 1 }), false)
    assert.strictEqual(T2.is(undefined), false)
  })
})
