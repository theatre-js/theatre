import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import {assertSuccess, assertFailure, DateFromNumber} from './testHelpers'

describe('readonly', () => {
  it('should succeed validating a valid value', () => {
    const T = t.readonly(t.interface({a: t.number}))
    assertSuccess(T.rootValidate({a: 1}))
  })

  it('should fail validating an invalid value', () => {
    const T = t.readonly(t.interface({a: t.number}))
    assertFailure(T.rootValidate({}), [
      'Invalid value undefined supplied to : Readonly<{ a: number }>/a: number',
    ])
  })

  it('should type guard', () => {
    const T1 = t.readonly(t.type({a: t.number}))
    assert.strictEqual(T1.is({a: 1}), true)
    assert.strictEqual(T1.is({a: 'foo'}), false)
    assert.strictEqual(T1.is(undefined), false)
    const T2 = t.readonly(t.type({a: DateFromNumber}))
    assert.strictEqual(T2.is({a: new Date(0)}), true)
    assert.strictEqual(T2.is({a: 0}), false)
    assert.strictEqual(T2.is(undefined), false)
  })
})
