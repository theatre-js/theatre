import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import {assertSuccess, assertFailure} from './testHelpers'

describe('withRuntimeCheck', () => {
  const T = t.string.withRuntimeCheck(v =>
    v.length === 2 ? true : ['the string should have a length of 10'],
  )
  it('should succeed validating a valid value', () => {
    assertSuccess(T.validate('12'))
  })

  it('should fail validating an invalid value', () => {
    assertFailure(T.validate('1'), [
      'Invalid value "1" supplied to : string (with runtime checks). Info: the string should have a length of 10',
    ])
  })

  it('should type guard', () => {
    assert.strictEqual(T.is('12'), true)
    assert.strictEqual(T.is('123'), false)
    assert.strictEqual(T.is(undefined), false)
  })
})
