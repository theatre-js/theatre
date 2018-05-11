import * as t from '$shared/ioTypes'
import * as assert from 'assert'
import {assertFailure, assertSuccess} from './testHelpers'

const TUA = t.type(
  {
    type: t.literal('a'),
    foo: t.string,
  },
  'TUA',
)

const TUB = t.intersection(
  [
    t.type({
      type: t.literal('b'),
    }),
    t.type({
      bar: t.number,
    }),
  ],
  'TUB',
)

const TUC = t.exact(
  t.type({
    type: t.literal('c'),
    baz: t.number,
  }),
  'TUC',
)

const T = t.taggedUnion('type', [TUA, TUB, TUC])

describe('taggedUnion', () => {
  it('should succeed validating a valid value', () => {
    assertSuccess(T.validate({type: 'a', foo: 'foo'}))
    assertSuccess(T.validate({type: 'b', bar: 1}))
    assertSuccess(T.validate({type: 'c', baz: 0}))
  })

  it('should fail validating an invalid value', () => {
    assertFailure(T.validate(true), [
      'Invalid value true supplied to : (TUA | TUB | TUC)',
    ])
    assertFailure(T.validate({type: 'D'}), [
      'Invalid value "D" supplied to : (TUA | TUB | TUC)/type: "a" | "b" | "c"',
    ])
    assertFailure(T.validate({type: 'a'}), [
      'Invalid value undefined supplied to : (TUA | TUB | TUC)/0: TUA/foo: string',
    ])
    assertFailure(T.validate({type: 'b'}), [
      'Invalid value undefined supplied to : (TUA | TUB | TUC)/1: TUB/bar: number',
    ])
    assertFailure(T.validate({type: 'c'}), [
      'Invalid value undefined supplied to : (TUA | TUB | TUC)/2: TUC/baz: number',
    ])
  })

  it('should type guard', () => {
    assert.strictEqual(T.is({type: 'a', foo: 'foo'}), true)
    assert.strictEqual(T.is({type: 'b', bar: 1}), true)
    assert.strictEqual(T.is({type: 'c', baz: 10}), true)
    assert.strictEqual(T.is(true), false)
    assert.strictEqual(T.is({type: 'a'}), false)
  })

  it('should work when tag values are numbers', () => {
    const A = t.type(
      {
        type: t.literal(1),
        foo: t.string,
      },
      'A',
    )

    const B = t.type(
      {
        type: t.literal(2),
        bar: t.number,
      },
      'B',
    )

    const C = t.type(
      {
        type: t.literal(3),
        baz: t.number,
      },
      'C',
    )

    const U = t.taggedUnion('type', [A, B, C], 'U')

    assert.strictEqual(U.is({type: 1, foo: 'foo'}), true)
    assert.strictEqual(U.is({type: 1, foo: 0}), false)
    assert.strictEqual(U.is({type: 2, bar: 0}), true)
    assert.strictEqual(U.is({type: 2, bar: 'bar'}), false)
    assert.strictEqual(U.is({type: 4}), false)
    assert.strictEqual(U.is({type: '1', foo: 'foo'}), false)

    assertSuccess(U.validate({type: 1, foo: 'foo'}))
    assertFailure(U.validate({type: 1, foo: 0}), [
      'Invalid value 0 supplied to : U/0: A/foo: string',
    ])
    assertSuccess(U.validate({type: 2, bar: 0}))
    assertFailure(U.validate({type: 2, bar: 'bar'}), [
      'Invalid value "bar" supplied to : U/1: B/bar: number',
    ])
    assertFailure(U.validate({type: 4}), [
      'Invalid value 4 supplied to : U/type: 1 | 2 | 3',
    ])
  })

  it('should work when tag values are booleans', () => {
    const A = t.type(
      {
        type: t.literal(true),
        foo: t.string,
      },
      'A',
    )

    const B = t.type(
      {
        type: t.literal(false),
        bar: t.number,
      },
      'B',
    )

    const U = t.taggedUnion('type', [A, B], 'U')

    assert.strictEqual(U.is({type: true, foo: 'foo'}), true)
    assert.strictEqual(U.is({type: true, foo: 0}), false)
    assert.strictEqual(U.is({type: false, bar: 0}), true)
    assert.strictEqual(U.is({type: false, bar: 'bar'}), false)
    assert.strictEqual(U.is({type: 3}), false)

    assertSuccess(U.validate({type: true, foo: 'foo'}))
    assertFailure(U.validate({type: true, foo: 0}), [
      'Invalid value 0 supplied to : U/0: A/foo: string',
    ])
    assertSuccess(U.validate({type: false, bar: 0}))
    assertFailure(U.validate({type: false, bar: 'bar'}), [
      'Invalid value "bar" supplied to : U/1: B/bar: number',
    ])
    assertFailure(U.validate({type: 3}), [
      'Invalid value 3 supplied to : U/type: true | false',
    ])
  })

  it('should work when tag values are both strings and numbers with the same string representation', () => {
    const A = t.type(
      {
        type: t.literal(1),
        foo: t.string,
      },
      'A',
    )

    const B = t.type(
      {
        type: t.literal('1'),
        bar: t.number,
      },
      'B',
    )

    const U = t.taggedUnion('type', [A, B], 'U')

    assert.strictEqual(U.is({type: 1, foo: 'foo'}), true)
    assert.strictEqual(U.is({type: 1, bar: 'bar'}), false)
    assert.strictEqual(U.is({type: '1', foo: 'foo'}), false)
    assert.strictEqual(U.is({type: '1', bar: 2}), true)
    assert.strictEqual(U.is({type: 3}), false)

    assertSuccess(U.validate({type: 1, foo: 'foo'}))
    assertFailure(U.validate({type: 1, bar: 'bar'}), [
      'Invalid value undefined supplied to : U/0: A/foo: string',
    ])
    assertSuccess(U.validate({type: '1', bar: 2}))
    assertFailure(U.validate({type: '1', foo: 'foo'}), [
      'Invalid value undefined supplied to : U/1: B/bar: number',
    ])
    assertFailure(U.validate({type: 3}), [
      'Invalid value 3 supplied to : U/type: 1 | "1"',
    ])
  })
})
