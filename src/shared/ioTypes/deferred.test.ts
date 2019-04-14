import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import {assertSuccess, assertFailure} from './testHelpers'

describe('deferred', () => {
  it('should succeed validating a valid value', () => {
    const T = t.deferred(() => t.number)
    assertSuccess(T.validate(10))
  })

  it('should fail validating an invalid value', () => {
    const T = t.deferred(() => t.number)

    assertFailure(T.validate('s'), ['Invalid value "s" supplied to : number'])
  })

  it('should type guard', () => {
    const T = t.deferred(() => t.number)

    assert.strictEqual(T.is(10), true)
    assert.strictEqual(T.is('foo'), false)
  })
})
