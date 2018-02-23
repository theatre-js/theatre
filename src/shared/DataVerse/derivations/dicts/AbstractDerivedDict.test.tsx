import atomifyDeep from '$src/shared/DataVerse/atoms/atomifyDeep'
import AbstractDerivedDict from '$src/shared/DataVerse/derivations/dicts/AbstractDerivedDict'
import {BoxAtom} from '$src/shared/DataVerse/atoms/box'

describe('AbstractDerivedDict', () => {
  it.skip('should work', () => {})

  function typeTests() {
    const o1 = atomifyDeep({
      foo: 'string',
      bar: 10,
      obj: {
        objFoo: 'string',
      },
    })

    const o1DD = o1.derivedDict()

    // const du = null as $IntentionalAny
    // const dd: AbstractDerivedDict<{foo: BoxAtom<string>}> = du
    // dd.prop('foo').getValue() as string
    // dd.prop('foo').getValue() as number


    // dd as AbstractDerivedDict<{foo: boolean}>

    o1DD as AbstractDerivedDict<{foo: BoxAtom<string>}>
    o1DD as AbstractDerivedDict<{foo: BoxAtom<number>}>

    o1DD.prop('foo').getValue() as string
    o1DD.prop('foo').getValue() as number

    o1DD.pointer().prop('foo').getValue() as string
    o1DD.pointer().prop('foo').getValue() as number

    o1DD.prop('bar').getValue() as number
    o1DD.prop('bar').getValue() as string

    o1DD.pointer().prop('bar').getValue() as number
    o1DD.pointer().prop('bar').getValue() as string

    o1DD.prop('obj').getValue() as AbstractDerivedDict<{objFoo: BoxAtom<string>}>
    o1DD.prop('obj').getValue() as AbstractDerivedDict<{objFoo: BoxAtom<number>}>

    o1DD.pointer().prop('obj').getValue() as AbstractDerivedDict<{objFoo: BoxAtom<string>}>
    o1DD.pointer().prop('obj').getValue() as AbstractDerivedDict<{objFoo: BoxAtom<number>}>

    o1DD.pointer().prop('obj').prop('objFoo').getValue() as string
    o1DD.pointer().prop('obj').prop('objFoo').getValue() as number

    const o2 = atomifyDeep({
      foo: 10,
      baz: 'baz'
    })

    const o2DD = o2.derivedDict()

    const o1eo2DD = o1DD.extend(o2DD)

    o1eo2DD.prop('foo').getValue() as number
    o1eo2DD.prop('foo').getValue() as string

    o1eo2DD.prop('bar').getValue() as number
    o1eo2DD.prop('bar').getValue() as string

    o1eo2DD.prop('baz').getValue() as string
    o1eo2DD.prop('baz').getValue() as number

    o1eo2DD.prop('obj').getValue() as AbstractDerivedDict<{objFoo: BoxAtom<string>}>
    o1eo2DD.prop('obj').getValue() as AbstractDerivedDict<{objFoo: BoxAtom<number>}>


  }
})
