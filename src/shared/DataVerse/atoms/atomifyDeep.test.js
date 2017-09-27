// @flow
import {default as atomifyDeep} from './atomifyDeep'
import type {IArrayAtom} from './ArrayAtom'
import type {IMapAtom} from './MapAtom'
import type {IBoxAtom} from './BoxAtom'

describe('DataVerse.atomifyDeep', () => {
  it('shoudl work', () => {
    expect(atomifyDeep('hi').unboxDeep()).toEqual('hi')
    expect(atomifyDeep({}).unboxDeep()).toMatchObject({})
    expect(atomifyDeep({a: 'a'}).unboxDeep()).toMatchObject({a: 'a'})
    expect(atomifyDeep({a: 'a', b: {a: {b: 'hi'}}}).unboxDeep()).toMatchObject({a: 'a', b: {a: {b: 'hi'}}})

    const ref = atomifyDeep({a: 'a', b: {c: 2, d: new Error()}});
    (ref.prop('b').prop('d').getValue(): Error)
    expect(ref.prop('a').getValue()).toEqual('a')
    expect(ref.prop('b').isAtom).toEqual(true)
    expect(ref.prop('b').prop('c').getValue()).toEqual(2)
    expect(ref.prop('b').prop('d').getValue()).toBeInstanceOf(Error)
  })

  function typeTests() { // eslint-disable-line no-unused-vars
    // const a = atomifyDeep('hi');

    (atomifyDeep({a: 'foo'}): IMapAtom<{a: IBoxAtom<string>}>);

    // $FixMe
    (atomifyDeep({a: 'foo'}): IMapAtom<{a: IBoxAtom<number>}>);

    (atomifyDeep({a: 'foo', b: 12}): IMapAtom<{a: IBoxAtom<string>, b: IBoxAtom<number>}>);

    (atomifyDeep({a: 'foo', b: 12}): IMapAtom<{a: IBoxAtom<string>, b: IBoxAtom<number>}>);
    (atomifyDeep({a: 'foo', b: {bar: 'bar', baz: true}}): IMapAtom<{a: IBoxAtom<string>, b: IMapAtom<{bar: IBoxAtom<string>, baz: IBoxAtom<boolean>}>}>)

    // type A = {a: string, b: number, c: boolean}
    // type AR = $Call<typeof atomifyDeep, A>
    // (atomifyDeep({a: 'hi', b: 10, c: true}): AR);

    // (atomifyDeep({str: 'str', num: 1}): IMapAtom<{str: IBoxAtom<string>, num: IBoxAtom<number>}>);
    // (atomifyDeep({str: 'str', num: 1}): $Call<typeof atomifyDeep, {str: string, num: number}>);
    // (atomifyDeep({str: 'str', num: 1}): $Call<typeof atomifyDeep, {str: string, num: number, p: number}>);
    // (atomifyDeep([1, 2]): IArrayAtom<IBoxAtom<number>>);
    // (atomifyDeep([1, 2]): $Call<typeof atomifyDeep, Array<number>>);
    // (atomifyDeep([{foo: 'bar'}]): IArrayAtom<IMapAtom<{foo: IBoxAtom<string>}>>);
    // (atomifyDeep([{foo: 'bar'}]): $Call<typeof atomifyDeep, Array<{foo: string}>>)
  }
})