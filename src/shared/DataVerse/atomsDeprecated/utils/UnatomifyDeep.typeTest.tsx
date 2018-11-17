import dictAtom, {DictAtom} from '$shared/DataVerse/atomsDeprecated/dictAtom'
import {ArrayAtom} from '$shared/DataVerse/atomsDeprecated/arrayAtom'
import {BoxAtom} from '$shared/DataVerse/atomsDeprecated/boxAtom'

// unboxDeep
;() => {
  const d = dictAtom<{
    a: string
    b: DictAtom<{
      ba: string
      bb: ArrayAtom<DictAtom<{bba: string}>>
      bc: BoxAtom<number>
    }>
  }>(null as $IntentionalAny)

  type Expected = {
    a: string
    b: {
      ba: string
      bb: {bba: string}[]
      bc: number
    }
  }

  d.unboxDeep() as Expected

  // $ExpectError
  d.unboxDeep() as {
    a: number // <<
    b: {
      ba: string
      bb: {bba: string}[]
      bc: number
    }
  }

  // $ExpectError
  d.unboxDeep() as {
    a: string
    b: {
      ba: number // <<
      bb: {bba: string}[]
      bc: number
    }
  }

  // $ExpectError
  d.unboxDeep() as {
    a: string
    b: {
      ba: number
      bb: {bba: number}[] // <<
      bc: number
    }
  }

  // $ExpectError
  d.unboxDeep() as {
    a: string
    b: {
      ba: number
      bb: {bba: string} // <<
      bc: number
    }
  }

  // $ExpectError
  d.unboxDeep() as {
    a: string
    b: {
      ba: string
      bb: {bba: string}[]
      bc: string // <<
    }
  }

  // $ExpectError
  d.unboxDeep() as 'foo'
}
