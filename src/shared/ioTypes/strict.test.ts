import * as t from '$shared/ioTypes'
import * as assert from 'assert'
import {assertFailure, assertSuccess} from './testHelpers'

describe('strict', () => {
  it('should succeed validating a valid value', () => {
    const T = t.strict({foo: t.string})
    assertSuccess(T.rootValidate({foo: 'foo'}))
  })

  it('should succeed validating an undefined field', () => {
    const T = t.strict({foo: t.string, bar: t.union([t.string, t.undefined])})
    assertSuccess(T.rootValidate({foo: 'foo'}))
  })

  it('should fail validating an invalid value', () => {
    const T = t.strict({foo: t.string})
    assertFailure(T.rootValidate({foo: 'foo', bar: 1, baz: true}), [
      'Invalid value 1 supplied to : StrictType<{ foo: string }>/bar: never',
      'Invalid value true supplied to : StrictType<{ foo: string }>/baz: never',
    ])
  })

  it('should assign a default name', () => {
    const T1 = t.strict({foo: t.string}, 'Foo')
    assert.strictEqual(T1.name, 'Foo')
    const T2 = t.strict({foo: t.string})
    assert.strictEqual(T2.name, 'StrictType<{ foo: string }>')
  })

  it('should type guard', () => {
    const T1 = t.strict({a: t.number})
    assert.strictEqual(T1.is({a: 0}), true)
    assert.strictEqual(T1.is({a: 0, b: 1}), false)
    assert.strictEqual(T1.is(undefined), false)
  })
})
