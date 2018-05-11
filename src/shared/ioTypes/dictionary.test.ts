import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure, string2 } from './testHelpers'

describe('dictionary', () => {
  it('should succeed validating a valid value', () => {
    const T1 = t.dictionary(t.string, t.number)
    assertSuccess(T1.rootValidate({}))
    assertSuccess(T1.rootValidate({ aa: 1 }))
    const T2 = t.dictionary(t.refinement(t.string, s => s.length >= 2), t.number)
    assertSuccess(T2.rootValidate({}))
    assertSuccess(T2.rootValidate({ aa: 1 }))
    const T3 = t.dictionary(string2, t.number)
    assertSuccess(T3.rootValidate({}))
    assertSuccess(T3.rootValidate({ aa: 1 }))
  })

  it('should fail validating an invalid value', () => {
    const T = t.dictionary(t.string, t.number)
    assertFailure(T.rootValidate({ aa: 's' }), ['Invalid value "s" supplied to : { [K in string]: number }/aa: number'])
  })

  it('should support literals as domain type', () => {
    const T = t.dictionary(t.literal('foo'), t.string)
    assertSuccess(T.rootValidate({ foo: 'bar' }))
    assertFailure(T.rootValidate({ foo: 'bar', baz: 'bob' }), [
      'Invalid value "baz" supplied to : { [K in "foo"]: string }/baz: "foo"'
    ])
  })

  it('should support keyof as domain type', () => {
    const T = t.dictionary(t.keyof({ foo: true, bar: true }), t.string)
    assertSuccess(T.rootValidate({ foo: 'bar' }))
    assertFailure(T.rootValidate({ foo: 'bar', baz: 'bob' }), [
      'Invalid value "baz" supplied to : { [K in (keyof ["foo","bar"])]: string }/baz: (keyof ["foo","bar"])'
    ])
  })

  it('should type guard', () => {
    const T1 = t.dictionary(t.string, t.number)
    assert.strictEqual(T1.is({}), true)
    assert.strictEqual(T1.is({ a: 1 }), true)
    assert.strictEqual(T1.is({ a: 'foo' }), false)
    const T3 = t.dictionary(string2, t.number)
    assert.strictEqual(T3.is({}), true)
    assert.strictEqual(T3.is({ 'a-a': 1 }), true)
    assert.strictEqual(T3.is({ aa: 1 }), false)
  })
})
