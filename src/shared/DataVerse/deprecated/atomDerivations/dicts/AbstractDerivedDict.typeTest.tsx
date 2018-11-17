import AbstractDerivedDict from './AbstractDerivedDict'
import {_any, expectType} from '$shared/types'
import {BoxAtom} from '$shared/DataVerse/deprecated/atoms/boxAtom'
import {DictAtom} from '$shared/DataVerse/deprecated/atoms/dictAtom'
import {ArrayAtom} from '$shared/DataVerse/deprecated/atoms/arrayAtom'
import AbstractDerivedArray from '$shared/DataVerse/deprecated/atomDerivations/arrays/AbstractDerivedArray'

// Basic
;() => {
  const dict: DictAtom<{
    a: string
    b: number
    c: BoxAtom<number>
  }> = _any
  const d = dict.derivedDict()

  // $ExpectError
  d.prop('nonExistentProp')

  expectType<string>(d.prop('a').getValue())
  // $ExpectError
  expectType<number>(d.prop('a').getValue())

  expectType<number>(d.prop('b').getValue())
  // $ExpectError
  expectType<string>(d.prop('b').getValue())

  expectType<number>(d.prop('c').getValue())
  // $ExpectError
  expectType<string>(d.prop('c').getValue())
}

// DictAtom > DictAtom > BoxAtom
;() => {
  const _d: DictAtom<{
    a: DictAtom<{aa: DictAtom<{aaa: BoxAtom<string>}>}>
  }> = _any

  const d = _d.derivedDict()

  const valueOfA = d.prop('a').getValue()

  expectType<AbstractDerivedDict<{aa: DictAtom<{aaa: BoxAtom<string>}>}>>(
    valueOfA,
  )

  expectType<AbstractDerivedDict<{aa: DictAtom<{aaa: BoxAtom<number>}>}>>(
    // $ExpectError
    valueOfA,
  )

  const valueOfAA = valueOfA.prop('aa').getValue()

  expectType<AbstractDerivedDict<{aaa: BoxAtom<string>}>>(valueOfAA)

  expectType<AbstractDerivedDict<{aaa: BoxAtom<number>}>>(
    // $ExpectError
    valueOfAA,
  )

  const valueOfAAA = valueOfAA.prop('aaa').getValue()

  expectType<string>(valueOfAAA)
  // $ExpectError
  expectType<number>(valueOfAAA)
}

// DictAtom > ArrayAtom > DictAtom > BoxAtom
;() => {
  const _d: DictAtom<{
    a: ArrayAtom<DictAtom<{aa: DictAtom<{aaa: BoxAtom<string>}>}>>
  }> = _any

  const d = _d.derivedDict()

  const valueOfA = d.prop('a').getValue()

  expectType<
    AbstractDerivedArray<DictAtom<{aa: DictAtom<{aaa: BoxAtom<string>}>}>>
  >(valueOfA)

  const valueOfAAA = valueOfA
    .index(1)
    .getValue()
    .prop('aa')
    .getValue()
    .prop('aaa')
    .getValue()

  expectType<string>(valueOfAAA)

  // $ExpectError
  expectType<number>(valueOfAAA)
}
