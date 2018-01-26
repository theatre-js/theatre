// @flow
import {default as atomifyDeep} from './atomifyDeep'
import {DictAtom} from '$src/shared/DataVerse/atoms/dict'
import {BoxAtom} from '$src/shared/DataVerse/atoms/box'

describe('DataVerse.atomifyDeep', () => {
  it('shoudl work', () => {
    expect(atomifyDeep('hi').unboxDeep()).toEqual('hi')
    expect(atomifyDeep({}).unboxDeep()).toMatchObject({})
    expect(atomifyDeep({a: 'a'}).unboxDeep()).toMatchObject({a: 'a'})
    expect(atomifyDeep({a: 'a', b: {a: {b: 'hi'}}}).unboxDeep()).toMatchObject({
      a: 'a',
      b: {a: {b: 'hi'}},
    })

    const ref = atomifyDeep({a: 'a', b: {c: 2, d: new Error()}})
    ref
      .prop('b')
      .prop('d')
      .getValue() as Error
    expect(ref.prop('a').getValue()).toEqual('a')
    expect(ref.prop('b').isAtom).toEqual(true)
    expect(
      ref
        .prop('b')
        .prop('c')
        .getValue(),
    ).toEqual(2)
    expect(
      ref
        .prop('b')
        .prop('d')
        .getValue(),
    ).toBeInstanceOf(Error)
  })

  // eslint-disable-next-line no-unused-vars
  function typeTests() {
    // const a = atomifyDeep('hi');

    atomifyDeep({a: 'foo'}) as DictAtom<{a: BoxAtom<string>}>
    atomifyDeep({a: 'foo'}) as DictAtom<{a: BoxAtom<number>}>
    atomifyDeep({a: 'foo', b: 12}) as DictAtom<{
      a: BoxAtom<string>
      b: BoxAtom<number>
    }>
    atomifyDeep({a: 'foo', b: 12}) as DictAtom<{
      a: BoxAtom<string>
      b: BoxAtom<number>
    }>
    atomifyDeep({a: 'foo', b: {bar: 'bar', baz: true}}) as DictAtom<{
      a: BoxAtom<string>
      b: DictAtom<{bar: BoxAtom<string>; baz: BoxAtom<boolean>}>
    }>

    // type A = {a: string, b: number, c: boolean}
    // type AR = $Call<typeof atomifyDeep, A>
    // (atomifyDeep({a: 'hi', b: 10, c: true}): AR);

    // (atomifyDeep({str: 'str', num: 1}): DictAtom<{str: BoxAtom<string>, num: BoxAtom<number>}>);
    // (atomifyDeep({str: 'str', num: 1}): $Call<typeof atomifyDeep, {str: string, num: number}>);
    // (atomifyDeep({str: 'str', num: 1}): $Call<typeof atomifyDeep, {str: string, num: number, p: number}>);
    // (atomifyDeep([1, 2]): IArrayAtom<BoxAtom<number>>);
    // (atomifyDeep([1, 2]): $Call<typeof atomifyDeep, Array<number>>);
    // (atomifyDeep([{foo: 'bar'}]): IArrayAtom<DictAtom<{foo: BoxAtom<string>}>>);
    // (atomifyDeep([{foo: 'bar'}]): $Call<typeof atomifyDeep, Array<{foo: string}>>)
  }
})
