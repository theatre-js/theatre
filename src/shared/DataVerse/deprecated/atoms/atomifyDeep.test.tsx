import {default as atomifyDeep} from './atomifyDeep'
import {DictAtom} from '$shared/DataVerse/deprecated/atoms/dictAtom'
import boxAtom, {BoxAtom} from '$shared/DataVerse/deprecated/atoms/boxAtom'
import {ArrayAtom} from '$shared/DataVerse/deprecated/atoms/arrayAtom'

describe('DataVerse.atomifyDeep', () => {
  it('shoudl work', () => {
    expect(atomifyDeep('hi').unboxDeep()).toEqual('hi')
    expect(atomifyDeep({}).unboxDeep()).toMatchObject({})
    expect(atomifyDeep({a: 'a'}).unboxDeep()).toMatchObject({a: 'a'})
    expect(atomifyDeep({a: 'a', b: {a: {b: 'hi'}}}).unboxDeep()).toMatchObject({
      a: 'a',
      b: {a: {b: 'hi'}},
    })

    const ref: DictAtom<{
      a: BoxAtom<string>
      b: DictAtom<{
        c: BoxAtom<number>
        d: BoxAtom<Error>
      }>
    }> = atomifyDeep({
      a: 'a',
      b: {c: 2, d: boxAtom(new Error())},
    })
    ref
      .prop('b')
      .prop('d')
      .getValue()
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

  // @ts-ignore @ignore
  function typeTests() {
    atomifyDeep({a: 'foo'}) as DictAtom<{a: BoxAtom<string>}>
    // @ts-ignore expected
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

    atomifyDeep({
      str: 'str',
      num: 1,
      obj: {str: 'str', arr: [true]},
    }) as DictAtom<{
      str: BoxAtom<string>
      num: BoxAtom<number>
      obj: DictAtom<{str: BoxAtom<string>; arr: ArrayAtom<BoxAtom<boolean>>}>
    }>

    // @ts-ignore expected
    atomifyDeep({
      str: 'str',
      num: 1,
      obj: {str: 'str', arr: [true]},
    }) as DictAtom<{
      str: BoxAtom<string>
      num: BoxAtom<number>
      obj: DictAtom<{str: BoxAtom<string>; arr: ArrayAtom<BoxAtom<string>>}>
    }>

    // @ts-ignore expected
    atomifyDeep({
      str: 'str',
      num: 1,
      obj: {str: 'str', arr: [true]},
    }) as DictAtom<{
      str: BoxAtom<string>
      num: BoxAtom<number>
      obj: DictAtom<{str: BoxAtom<number>; arr: ArrayAtom<BoxAtom<boolean>>}>
    }>
  }
})
