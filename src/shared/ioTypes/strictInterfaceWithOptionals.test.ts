import * as t from '$shared/ioTypes'
import {assertSuccess, assertFailure} from './testHelpers'
import * as assert from 'assert'

export function strictInterfaceWithOptionals<
  R extends t.Props,
  O extends t.Props
>(
  required: R,
  optional: O,
  name?: string,
): t.Type<
  t.TypeOfProps<R> & t.TypeOfPartialProps<O>,
  t.OutputOfProps<R> & t.OutputOfPartialProps<O>
> {
  return t.exact(
    t.intersection([t.interface(required), t.partial(optional)]),
    name,
  )
}

describe('strictInterfaceWithOptionals', () => {
  it('should succeed validating a valid value', () => {
    const T = strictInterfaceWithOptionals(
      {foo: t.string},
      {bar: t.string},
      'T',
    )
    assertSuccess(T.rootValidate({foo: 'foo'}))
    assertSuccess(T.rootValidate({foo: 'foo', bar: 'a'}))
  })

  it('should fail validating an invalid value', () => {
    const T = strictInterfaceWithOptionals(
      {foo: t.string},
      {bar: t.string},
      'T',
    )
    assertFailure(T.rootValidate({foo: 'foo', a: 1}), [
      'Invalid value 1 supplied to : T/a: never',
    ])
    assertFailure(T.rootValidate({foo: 'foo', bar: 1}), [
      'Invalid value 1 supplied to : T/bar: (string | undefined)/0: string',
      'Invalid value 1 supplied to : T/bar: (string | undefined)/1: undefined',
    ])
  })

  it('should type guard', () => {
    const T = strictInterfaceWithOptionals(
      {foo: t.string},
      {bar: t.string},
      'T',
    )
    assert.strictEqual(T.is({foo: 'foo'}), true)
    assert.strictEqual(T.is({foo: 'foo', bar: 'a'}), true)
    assert.strictEqual(T.is({foo: 'foo', a: 1}), false)
  })
})
