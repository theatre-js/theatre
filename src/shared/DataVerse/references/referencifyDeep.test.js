// @flow
import {default as referencifyDeep} from './referencifyDeep'
import {type IArrayOfReferences} from './ArrayOfReferences'
import {type IMapOfReferences, default as MapOfReferences} from './MapOfReferences'
import {type IReference, default as Reference} from './Reference'

describe('DataVerse.referencifyDeep', () => {
  it('shoudl work', () => {
    expect(referencifyDeep('hi').unboxDeep()).toEqual('hi')
    expect(referencifyDeep({}).unboxDeep()).toMatchObject({})
    expect(referencifyDeep({a: 'a'}).unboxDeep()).toMatchObject({a: 'a'})
    expect(referencifyDeep({a: 'a', b: {a: {b: 'hi'}}}).unboxDeep()).toMatchObject({a: 'a', b: {a: {b: 'hi'}}})

    const ref = referencifyDeep({a: 'a', b: {c: 2, d: new Error()}});
    (ref.get('b').get('d').get(): Error)
    expect(ref.get('a').get()).toEqual('a')
    expect(ref.get('b').isReference).toEqual(true)
    expect(ref.get('b').get('c').get()).toEqual(2)
    expect(ref.get('b').get('d').get()).toBeInstanceOf(Error)
  })

  function typeTests() { // eslint-disable-line no-unused-vars
    const a = referencifyDeep('hi');

    (referencifyDeep({a: 'foo'}): IMapOfReferences<{a: IReference<string>}>);
    // $FlowExpectError
    (referencifyDeep({a: 'foo'}): IMapOfReferences<{a: IReference<number>}>);
    (referencifyDeep({a: 'foo', b: 12}): IMapOfReferences<{a: IReference<string>, b: IReference<number>}>);

    (referencifyDeep({a: 'foo', b: 12}): IMapOfReferences<{a: IReference<string>, b: IReference<number>}>);
    (referencifyDeep({a: 'foo', b: {bar: 'bar', baz: true}}): IMapOfReferences<{a: IReference<string>, b: IMapOfReferences<{bar: IReference<string>, baz: IReference<boolean>}>}>);

    type A = {a: string, b: number, c: boolean}
    type AR = $Call<typeof referencifyDeep, A>
    (referencifyDeep({a: 'hi', b: 10, c: true}): AR);

    (referencifyDeep({str: 'str', num: 1}): IMapOfReferences<{str: IReference<string>, num: IReference<number>}>);
    (referencifyDeep({str: 'str', num: 1}): $Call<typeof referencifyDeep, {str: string, num: number}>);
    (referencifyDeep({str: 'str', num: 1}): $Call<typeof referencifyDeep, {str: string, num: number, p: number}>);
    (referencifyDeep([1, 2]): IArrayOfReferences<IReference<number>>);
    (referencifyDeep([1, 2]): $Call<typeof referencifyDeep, Array<number>>);
    (referencifyDeep([{foo: 'bar'}]): IArrayOfReferences<IMapOfReferences<{foo: IReference<string>}>>);
    (referencifyDeep([{foo: 'bar'}]): $Call<typeof referencifyDeep, Array<{foo: string}>>);

    (function() {
      // type ReferencifyFn =
      //   (<V: IAbstractReference>(v: V) => V) &
      //   (<V, A: Array<V>>(a: A) => IArrayOfReferences<$Call<ReferencifyDeepFn, V>>) &
      //   (<V: {+constructor: Function}>(v: V) => IReference<V>) &
      //   (<V: {}>(v: V) => IMapOfReferences<$ObjMap<V, ReferencifyDeepFn>>) &
      //   (<V>(v: V) => IReference<V>)

      // export type $Call<typeof referencifyDeep, V> = $Call<ReferencifyDeepFn, V>

    })
  }
})