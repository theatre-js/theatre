import {deepStrictEqual} from 'assert'
import type {PathToProp} from '@theatre/utils/pathToProp'
import removePathFromObject from './removePathFromObject'
import type {SerializableMap} from '@theatre/utils/types'

const t = (objIn: SerializableMap, path: PathToProp, objOut: {}) => {
  removePathFromObject(objIn, path)
  deepStrictEqual(objIn, objOut)
  // expect(objIn).tomatch(objOut)
}

describe(`removePathFromObject()`, () => {
  test('tests', () => {
    t({foo: 'foo'}, [], {})
    t({toDelete: 'toDelete'}, ['toDelete'], {})
    t({toDelete: 'toDelete', bar: 'bar'}, ['toDelete'], {bar: 'bar'})
    t({foo: 'foo', toDelete: {baz: 'baz'}}, ['toDelete'], {foo: 'foo'})
    t(
      {foo: 'foo', toDelete: {toDelete2: 'toDelete2'}},
      ['toDelete', 'toDelete2'],
      {foo: 'foo'},
    )
    t(
      {foo: 'foo', bar: {toDelete: 'toDelete', extra: 'extra'}},
      ['bar', 'toDelete'],
      {
        foo: 'foo',
        bar: {
          extra: 'extra',
        },
      },
    )
    t({foo: 'foo'}, ['none'], {foo: 'foo'})
    t({foo: 'foo'}, ['none', 'existing', 'prop'], {foo: 'foo'})

    const foo = {one: {two: {three: 'three'}}}
    removePathFromObject(foo.one, ['two', 'three'])
    // make sure it doesn't delete above the base object
    deepStrictEqual(foo, {one: {}})
  })
})
