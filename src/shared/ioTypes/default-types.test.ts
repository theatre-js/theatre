import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure } from './testHelpers'

describe('Dictionary', () => {
  it('should accept arrays', () => {
    assertSuccess(t.Dictionary.rootValidate([]))
  })

  it('should accept objects', () => {
    assertSuccess(t.Dictionary.rootValidate({}))
  })

  it('should fail with primitives', () => {
    const T = t.Dictionary
    assertFailure(T.rootValidate('s'), ['Invalid value "s" supplied to : Dictionary'])
    assertFailure(T.rootValidate(1), ['Invalid value 1 supplied to : Dictionary'])
    assertFailure(T.rootValidate(true), ['Invalid value true supplied to : Dictionary'])
  })

  it('should fail with null and undefined', () => {
    const T = t.Dictionary
    assertFailure(T.rootValidate(null), ['Invalid value null supplied to : Dictionary'])
    assertFailure(T.rootValidate(undefined), ['Invalid value undefined supplied to : Dictionary'])
  })
})

describe('Integer', () => {
  it('should validate integers', () => {
    assertSuccess(t.Integer.rootValidate(1))
    assertFailure(t.Integer.rootValidate(0.5), ['Invalid value 0.5 supplied to : Integer'])
    assertFailure(t.Integer.rootValidate('foo'), ['Invalid value "foo" supplied to : Integer'])
  })
})

describe('null', () => {
  it('should support the alias `nullType`', () => {
    assertSuccess(t.null.rootValidate(null))
    assertFailure(t.null.rootValidate(1), ['Invalid value 1 supplied to : null'])
  })
})

describe('object', () => {
  it('should accept arrays', () => {
    assertSuccess(t.object.rootValidate([]))
  })

  it('should accept objects', () => {
    assertSuccess(t.object.rootValidate({}))
  })

  it('should fail with primitives', () => {
    const T = t.object
    assertFailure(T.rootValidate('s'), ['Invalid value "s" supplied to : object'])
    assertFailure(T.rootValidate(1), ['Invalid value 1 supplied to : object'])
    assertFailure(T.rootValidate(true), ['Invalid value true supplied to : object'])
  })

  it('should fail with null and undefined', () => {
    const T = t.object
    assertFailure(T.rootValidate(null), ['Invalid value null supplied to : object'])
    assertFailure(T.rootValidate(undefined), ['Invalid value undefined supplied to : object'])
  })
})

describe('Function', () => {
  it('should accept functions', () => {
    assertSuccess(t.Function.rootValidate(t.identity))
  })
})
