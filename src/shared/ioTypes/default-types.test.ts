import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure } from './testHelpers'

describe('Dictionary', () => {
  it('should accept arrays', () => {
    assertSuccess(t.Dictionary.decode([]))
  })

  it('should accept objects', () => {
    assertSuccess(t.Dictionary.decode({}))
  })

  it('should fail with primitives', () => {
    const T = t.Dictionary
    assertFailure(T.decode('s'), ['Invalid value "s" supplied to : Dictionary'])
    assertFailure(T.decode(1), ['Invalid value 1 supplied to : Dictionary'])
    assertFailure(T.decode(true), ['Invalid value true supplied to : Dictionary'])
  })

  it('should fail with null and undefined', () => {
    const T = t.Dictionary
    assertFailure(T.decode(null), ['Invalid value null supplied to : Dictionary'])
    assertFailure(T.decode(undefined), ['Invalid value undefined supplied to : Dictionary'])
  })
})

describe('Integer', () => {
  it('should validate integers', () => {
    assertSuccess(t.Integer.decode(1))
    assertFailure(t.Integer.decode(0.5), ['Invalid value 0.5 supplied to : Integer'])
    assertFailure(t.Integer.decode('foo'), ['Invalid value "foo" supplied to : Integer'])
  })
})

describe('null', () => {
  it('should support the alias `nullType`', () => {
    assertSuccess(t.null.decode(null))
    assertFailure(t.null.decode(1), ['Invalid value 1 supplied to : null'])
  })
})

describe('object', () => {
  it('should accept arrays', () => {
    assertSuccess(t.object.decode([]))
  })

  it('should accept objects', () => {
    assertSuccess(t.object.decode({}))
  })

  it('should fail with primitives', () => {
    const T = t.object
    assertFailure(T.decode('s'), ['Invalid value "s" supplied to : object'])
    assertFailure(T.decode(1), ['Invalid value 1 supplied to : object'])
    assertFailure(T.decode(true), ['Invalid value true supplied to : object'])
  })

  it('should fail with null and undefined', () => {
    const T = t.object
    assertFailure(T.decode(null), ['Invalid value null supplied to : object'])
    assertFailure(T.decode(undefined), ['Invalid value undefined supplied to : object'])
  })
})

describe('Function', () => {
  it('should accept functions', () => {
    assertSuccess(t.Function.decode(t.identity))
  })
})
