import * as t from '$shared/ioTypes'
import * as assert from 'assert'
import {assertFailure, assertSuccess} from './testHelpers'

describe('partial', () => {
  it('should succeed validating a valid value', () => {
    const T = t.partial({a: t.number})
    assertSuccess(T.validate({}))
    assertSuccess(T.validate({a: 1}))
  })

  it('should fail validating an invalid value', () => {
    const T = t.partial({a: t.number})
    assertFailure(T.validate({a: 's'}), [
      'Invalid value "s" supplied to : PartialType<{ a: number }>/a: (number | undefined)/<number>: number',
      'Invalid value "s" supplied to : PartialType<{ a: number }>/a: (number | undefined)/<undefined>: undefined',
    ])
  })

  it('should type guard', () => {
    const T1 = t.partial({a: t.number})
    assert.strictEqual(T1.is({}), true)
    assert.strictEqual(T1.is({a: 1}), true)
    assert.strictEqual(T1.is({a: 'foo'}), false)
    assert.strictEqual(T1.is(undefined), false)
  })
})
