import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure, DateFromNumber } from './testHelpers'

describe('interface', () => {
  it('should succeed validating a valid value', () => {
    const T = t.interface({ a: t.string })
    assertSuccess(T.rootValidate({ a: 's' }))
  })

  it('should fail validating an invalid value', () => {
    const T = t.interface({ a: t.string })
    assertFailure(T.rootValidate(1), ['Invalid value 1 supplied to : { a: string }'])
    assertFailure(T.rootValidate({}), ['Invalid value undefined supplied to : { a: string }/a: string'])
    assertFailure(T.rootValidate({ a: 1 }), ['Invalid value 1 supplied to : { a: string }/a: string'])
  })

  it('should support the alias `type`', () => {
    const T = t.type({ a: t.string })
    assertSuccess(T.rootValidate({ a: 's' }))
  })

  it('should type guard', () => {
    const T1 = t.type({ a: t.number })
    assert.strictEqual(T1.is({ a: 0 }), true)
    assert.strictEqual(T1.is(undefined), false)
    const T2 = t.type({ a: DateFromNumber })
    assert.strictEqual(T2.is({ a: new Date(0) }), true)
    assert.strictEqual(T2.is({ a: 0 }), false)
    assert.strictEqual(T2.is(undefined), false)
  })
})
