import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import {assertSuccess, assertFailure, string2} from './testHelpers'

describe('record', () => {
  it('should succeed validating a valid value', () => {
    const T1 = t.record(t.string, t.number)
    assertSuccess(T1.validate({}))
    assertSuccess(T1.validate({aa: 1}))
    const T2 = t.record(t.refinement(t.string, s => s.length >= 2), t.number)
    assertSuccess(T2.validate({}))
    assertSuccess(T2.validate({aa: 1}))
    const T3 = t.record(string2, t.number)
    assertSuccess(T3.validate({}))
    assertSuccess(T3.validate({aa: 1}))
  })

  it('should fail validating an invalid value', () => {
    const T = t.record(t.string, t.number)
    assertFailure(T.validate({aa: 's'}), [
      'Invalid value "s" supplied to : { [K in string]: number }/aa: number',
    ])
  })

  it('should support literals as domain type', () => {
    const T = t.record(t.literal('foo'), t.string)
    assertSuccess(T.validate({foo: 'bar'}))
    assertFailure(T.validate({foo: 'bar', baz: 'bob'}), [
      'Invalid value "baz" supplied to : { [K in "foo"]: string }/baz: "foo"',
    ])
  })

  it('should support keyof as domain type', () => {
    const T = t.record(t.keyof({foo: true, bar: true}), t.string)
    assertSuccess(T.validate({foo: 'bar'}))
    assertFailure(T.validate({foo: 'bar', baz: 'bob'}), [
      'Invalid value "baz" supplied to : { [K in (keyof ["foo","bar"])]: string }/baz: (keyof ["foo","bar"])',
    ])
  })

  it('should type guard', () => {
    const T1 = t.record(t.string, t.number)
    assert.strictEqual(T1.is({}), true)
    assert.strictEqual(T1.is({a: 1}), true)
    assert.strictEqual(T1.is({a: 'foo'}), false)
    const T3 = t.record(string2, t.number)
    assert.strictEqual(T3.is({}), true)
    assert.strictEqual(T3.is({'a-a': 1}), true)
    assert.strictEqual(T3.is({aa: 1}), false)
  })
})
