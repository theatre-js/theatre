import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure } from './testHelpers'

describe('Dictionary', () => {
  it('should accept arrays', () => {
    assertSuccess(t.Dictionary.validate([]))
  })

  it('should accept objects', () => {
    assertSuccess(t.Dictionary.validate({}))
  })

  it('should fail with primitives', () => {
    const T = t.Dictionary
    assertFailure(T.validate('s'), ['Invalid value "s" supplied to : Dictionary'])
    assertFailure(T.validate(1), ['Invalid value 1 supplied to : Dictionary'])
    assertFailure(T.validate(true), ['Invalid value true supplied to : Dictionary'])
  })

  it('should fail with null and undefined', () => {
    const T = t.Dictionary
    assertFailure(T.validate(null), ['Invalid value null supplied to : Dictionary'])
    assertFailure(T.validate(undefined), ['Invalid value undefined supplied to : Dictionary'])
  })
})

describe('Integer', () => {
  it('should _validateWithContext integers', () => {
    assertSuccess(t.Integer.validate(1))
    assertFailure(t.Integer.validate(0.5), ['Invalid value 0.5 supplied to : Integer'])
    assertFailure(t.Integer.validate('foo'), ['Invalid value "foo" supplied to : Integer'])
  })
})

describe('null', () => {
  it('should support the alias `nullType`', () => {
    assertSuccess(t.null.validate(null))
    assertFailure(t.null.validate(1), ['Invalid value 1 supplied to : null'])
  })
})

describe('object', () => {
  it('should accept arrays', () => {
    assertSuccess(t.object.validate([]))
  })

  it('should accept objects', () => {
    assertSuccess(t.object.validate({}))
  })

  it('should fail with primitives', () => {
    const T = t.object
    assertFailure(T.validate('s'), ['Invalid value "s" supplied to : object'])
    assertFailure(T.validate(1), ['Invalid value 1 supplied to : object'])
    assertFailure(T.validate(true), ['Invalid value true supplied to : object'])
  })

  it('should fail with null and undefined', () => {
    const T = t.object
    assertFailure(T.validate(null), ['Invalid value null supplied to : object'])
    assertFailure(T.validate(undefined), ['Invalid value undefined supplied to : object'])
  })
})

describe('Function', () => {
  it('should accept functions', () => {
    assertSuccess(t.Function.validate(t.identity))
  })
})
