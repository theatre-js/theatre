import * as t from '$shared/ioTypes'
import * as assert from 'assert'
import {assertFailure, assertSuccess} from './testHelpers'

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
  })
})
