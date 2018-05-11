import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure, assertStrictEqual, DateFromNumber } from './testHelpers'

type T = {
  a: number
  b: T | undefined | null
}
const T = t.recursion<T>('T', self =>
  t.interface({
    a: t.number,
    b: t.union([self, t.undefined, t.null])
  })
)

describe('recursion', () => {
  it('should succeed validating a valid value', () => {
    assertSuccess(T.decode({ a: 1, b: null }))
    assertSuccess(T.decode({ a: 1, b: { a: 2, b: null } }))
  })

  it('should return the same reference if validation succeeded', () => {
    type T = {
      a: number
      b: T | null | undefined
    }
    const T = t.recursion<T>('T', self =>
      t.interface({
        a: t.number,
        b: t.union([self, t.undefined, t.null])
      })
    )
    const value = { a: 1, b: { a: 2, b: null } }
    assertStrictEqual(T.decode(value), value)
  })

  it('should fail validating an invalid value', () => {
    assertFailure(T.decode(1), ['Invalid value 1 supplied to : T'])
    assertFailure(T.decode({}), ['Invalid value undefined supplied to : T/a: number'])
    assertFailure(T.decode({ a: 1, b: {} }), [
      'Invalid value undefined supplied to : T/b: (T | undefined | null)/0: T/a: number',
      'Invalid value {} supplied to : T/b: (T | undefined | null)/1: undefined',
      'Invalid value {} supplied to : T/b: (T | undefined | null)/2: null'
    ])
  })

  it('should serialize a deserialized', () => {
    type A = {
      a: Date
      b: A | null
    }
    type O = {
      a: number
      b: O | null
    }
    const T = t.recursion<A, O>('T', self =>
      t.interface({
        a: DateFromNumber,
        b: t.union([self, t.null])
      })
    )
  })

  it('should type guard', () => {
    type A = {
      a: Date
      b: A | null
    }
    type O = {
      a: number
      b: O | null
    }
    const T = t.recursion<A, O>('T', self =>
      t.interface({
        a: DateFromNumber,
        b: t.union([self, t.null])
      })
    )
    assert.strictEqual(T.is({ a: new Date(0), b: null }), true)
    assert.strictEqual(T.is({ a: 0 }), false)
  })

  it('should have a `type` field', () => {
    type T = {
      a: number
      b: T | null
    }
    const T = t.recursion<T>('T', self =>
      t.interface({
        a: t.number,
        b: t.union([self, t.null])
      })
    )
    assert.strictEqual(T.type instanceof t.Type, true)
    assert.strictEqual(T.type.name, '{ a: number, b: (T | null) }')
    assert.strictEqual((T.type as any).props.a._tag, 'NumberType')
  })

  it('should support mutually recursive types', () => {
    type A = {
      b: A | B | null
    }
    type B = {
      a: A | null
    }
    const A: t.RecursiveType<t.Mixed, A> = t.recursion<A>('A', self =>
      t.interface({
        b: t.union([self, B, t.null])
      })
    )
    const B = t.recursion<B>('B', () =>
      t.interface({
        a: t.union([A, t.null])
      })
    )
    assert.strictEqual(A.is({ b: { b: null } }), true)
    assert.strictEqual(A.is({ b: { a: { b: { a: null } } } }), true)
  })
})
