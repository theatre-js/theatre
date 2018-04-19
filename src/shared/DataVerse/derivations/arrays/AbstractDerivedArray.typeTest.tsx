import {_any, expectType} from '$shared/types'
import {ArrayAtom} from '$shared/DataVerse/atoms/arrayAtom'
import {BoxAtom} from '$shared/DataVerse/atoms/boxAtom'
import {DictAtom} from '$shared/DataVerse/atoms/dictAtom'
import AbstractDerivedDict from '../dicts/AbstractDerivedDict'

// ArrayAtom > string
;() => {
  const _d: ArrayAtom<string> = _any

  const d = _d.derivedArray()

  expectType<string>(d.index(1).getValue())

  // $ExpectError
  expectType<number>(d.index(1).getValue())
}

// ArrayAtom > BoxAtom<string>
;() => {
  const _d: ArrayAtom<BoxAtom<string>> = _any

  const d = _d.derivedArray()

  expectType<string>(d.index(1).getValue())

  // $ExpectError
  expectType<number>(d.index(1).getValue())
}

// ArrayAtom > DictAtom<BoxAtom<string>>
;() => {
  const _d: ArrayAtom<DictAtom<{a: BoxAtom<string>}>> = _any

  const d = _d.derivedArray()

  expectType<AbstractDerivedDict<{a: BoxAtom<string>}>>(d.index(1).getValue())
  // $ExpectError
  expectType<AbstractDerivedDict<{a: BoxAtom<number>}>>(d.index(1).getValue())

  expectType<string>(
    d
      .index(1)
      .getValue()
      .prop('a')
      .getValue(),
  )

  expectType<number>(
    // $ExpectError
    d
      .index(1)
      .getValue()
      .prop('a')
      .getValue(),
  )
}
