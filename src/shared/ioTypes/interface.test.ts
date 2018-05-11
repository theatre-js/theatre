import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, DateFromNumber } from './testHelpers'

describe('interface', () => {
  it('should succeed validating a valid value', () => {
    const T = t.interface({ a: t.string })
    assertSuccess(T.decode({ a: 's' }))
  })

  it('should keep unknown properties', () => {
    const T = t.interface({ a: t.string })
    const validation = T.decode({ a: 's', b: 1 })
    if (validation.isRight()) {
      assert.deepEqual(validation.value, { a: 's', b: 1 })
    } else {
      assert.ok(false)
    }
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.interface({ a: t.string })
    const value = { a: 's' }
    assertStrictEqual(T.decode(value), value)
  })

  it('should return the a new reference if validation succeeded and something changed', () => {
    const T = t.interface({ a: DateFromNumber, b: t.number })
    assertDeepEqual(T.decode({ a: 1, b: 2 }), { a: new Date(1), b: 2 })
  })

  it('should fail validating an invalid value', () => {
    const T = t.interface({ a: t.string })
    assertFailure(T.decode(1), ['Invalid value 1 supplied to : { a: string }'])
    assertFailure(T.decode({}), ['Invalid value undefined supplied to : { a: string }/a: string'])
    assertFailure(T.decode({ a: 1 }), ['Invalid value 1 supplied to : { a: string }/a: string'])
  })

  it('should support the alias `type`', () => {
    const T = t.type({ a: t.string })
    assertSuccess(T.decode({ a: 's' }))
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
