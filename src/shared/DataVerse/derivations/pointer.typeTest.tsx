import {DictAtom} from '$shared/DataVerse/atoms/dictAtom'
import {BoxAtom} from '$shared/DataVerse/atoms/boxAtom'
import {ArrayAtom} from '$shared/DataVerse/atoms/arrayAtom'
import {_any, expectType} from '$shared/types'
import AbstractDerivedDict from './dicts/AbstractDerivedDict'
import AbstractDerivedArray from './arrays/AbstractDerivedArray'

// DictAtom
;() => {
  const a: DictAtom<{a: string; b: number}> = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  p.getValue() as DictAtom<{a: string; b: number}>

  // $ExpectError
  p.getValue() as DictAtom<{a: string; b: string}>

  p.prop('a').getValue() as string
  pP.prop('a').getValue() as string

  // $ExpectError
  p.prop('a').getValue() as number
  // $ExpectError
  pP.prop('a').getValue() as number

  p.prop('b').getValue() as number
  pP.prop('b').getValue() as number
  // $ExpectError
  p.prop('b').getValue() as string
  // $ExpectError
  pP.prop('b').getValue() as string

  // $ExpectError
  p.prop('c').getValue() as string
  // $ExpectError
  pP.prop('c').getValue() as string
}
// DictAtom > BoxAtom
;() => {
  const a: DictAtom<{a: BoxAtom<string>}> = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  p.prop('a').getValue() as string
  pP.prop('a').getValue() as string

  // $ExpectError
  p.prop('a').getValue() as number
  // $ExpectError
  pP.prop('a').getValue() as number
}
// DictAtom > ArrayAtom
;() => {
  const a: DictAtom<{a: ArrayAtom<string>}> = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  p
    .prop('a')
    // $ExpectError
    .prop('a')
    .getValue() as string

  pP
    .prop('a')
    // $ExpectError
    .prop('a')
    .getValue() as string

  p
    .prop('a')
    // $ExpectError
    .prop('a')
    .getValue() as undefined

  pP
    .prop('a')
    // $ExpectError
    .prop('a')
    .getValue() as undefined

  p
    .prop('a')
    // $ExpectError
    .prop('a')
    .getValue() as string

  pP
    .prop('a')
    // $ExpectError
    .prop('a')
    .getValue() as string

  p
    .prop('a')
    .index(1)
    .getValue() as string

  pP
    .prop('a')
    .index(1)
    .getValue() as string

  // $ExpectError
  p
    .prop('a')
    .index(1)
    .getValue() as number

  // $ExpectError
  pP
    .prop('a')
    .index(1)
    .getValue() as number
}
// DictAtom > ArrayAtom > BoxAtom
;() => {
  const a: DictAtom<{a: ArrayAtom<BoxAtom<string>>}> = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  p
    .prop('a')
    // $ExpectError
    .prop('a')
    .getValue() as string

  pP
    .prop('a')
    // $ExpectError
    .prop('a')
    .getValue() as string

  p
    .prop('a')
    // $ExpectError
    .prop('a')
    .getValue() as undefined

  pP
    .prop('a')
    // $ExpectError
    .prop('a')
    .getValue() as undefined

  p
    .prop('a')
    // $ExpectError
    .prop('a')
    .getValue() as string

  pP
    .prop('a')
    // $ExpectError
    .prop('a')
    .getValue() as string

  p
    .prop('a')
    .index(1)
    .getValue() as string

  pP
    .prop('a')
    .index(1)
    .getValue() as string

  // $ExpectError
  p
    .prop('a')
    .index(1)
    .getValue() as number

  // $ExpectError
  pP
    .prop('a')
    .index(1)
    .getValue() as number
}

// ArrayAtom > BoxAtom
;() => {
  const a: ArrayAtom<BoxAtom<string>> = _any
  const p = a.pointer()
  const pP = a.derivedArray().pointer()

  // $ExpectError
  p.prop('a').getValue()
  // $ExpectError
  pP.prop('a').getValue()

  p.index(1).getValue() as string
  pP.index(1).getValue() as string

  // $ExpectError
  p.index(1).getValue() as number

  // $ExpectError
  pP.index(1).getValue() as number
}
// DictAtom > optional
;() => {
  const a: DictAtom<{b?: number}> = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  // $ExpectError
  expectType<number>(p.prop('b').getValue())
  // $ExpectError
  expectType<number>(pP.prop('b').getValue())
  // $ExpectError
  expectType<undefined>(p.prop('b').getValue())
  // $ExpectError
  expectType<undefined>(pP.prop('b').getValue())

  expectType<undefined | number>(p.prop('b').getValue())
  expectType<undefined | number>(pP.prop('b').getValue())
}
// DictAtom > undefined | BoxAtom
;() => {
  const a: DictAtom<{b?: BoxAtom<number>}> = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  // $ExpectError
  expectType<number>(p.prop('b').getValue())
  // $ExpectError
  expectType<number>(pP.prop('b').getValue())
  // $ExpectError
  expectType<undefined>(p.prop('b').getValue())
  // $ExpectError
  expectType<undefined>(pP.prop('b').getValue())

  expectType<undefined | number>(p.prop('b').getValue())
  expectType<undefined | number>(pP.prop('b').getValue())
}

// DictAtom > undefined | DictAtom > number
;() => {
  const a: DictAtom<{a?: DictAtom<{aa: number}>}> = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  expectType<undefined | DictAtom<{aa: number}>>(p.prop('a').getValue())
  expectType<undefined | AbstractDerivedDict<{aa: number}>>(
    pP.prop('a').getValue(),
  )

  // $ExpectError
  expectType<DictAtom<{aa: number}>>(p.prop('a').getValue())
  // $ExpectError
  expectType<DictAtom<{aa: number}>>(pP.prop('a').getValue())

  expectType<undefined | number>(
    p
      .prop('a')
      .prop('aa')
      .getValue(),
  )

  expectType<undefined | number>(
    pP
      .prop('a')
      .prop('aa')
      .getValue(),
  )

  expectType<undefined>(
    // $ExpectError
    p
      .prop('a')
      .prop('aa')
      .getValue(),
  )

  expectType<undefined>(
    // $ExpectError
    pP
      .prop('a')
      .prop('aa')
      .getValue(),
  )

  expectType<number>(
    // $ExpectError
    p
      .prop('a')
      .prop('aa')
      .getValue(),
  )

  expectType<number>(
    // $ExpectError
    pP
      .prop('a')
      .prop('aa')
      .getValue(),
  )
}

// DictAtom > undefined | DictAtom > number
;() => {
  const a: DictAtom<{a?: ArrayAtom<number>}> = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  expectType<undefined | ArrayAtom<number>>(p.prop('a').getValue())
  expectType<undefined | AbstractDerivedArray<number>>(pP.prop('a').getValue())

  // $ExpectError
  expectType<ArrayAtom<number>>(p.prop('a').getValue())
  // $ExpectError
  expectType<ArrayAtom<number>>(pP.prop('a').getValue())

  expectType<undefined | number>(
    p
      .prop('a')
      .index(1)
      .getValue(),
  )

  expectType<undefined | number>(
    pP
      .prop('a')
      .index(1)
      .getValue(),
  )

  expectType<undefined>(
    // $ExpectError
    p
      .prop('a')
      .index(1)
      .getValue(),
  )

  expectType<undefined>(
    // $ExpectError
    pP
      .prop('a')
      .index(1)
      .getValue(),
  )

  expectType<number>(
    // $ExpectError
    p
      .prop('a')
      .index(1)
      .getValue(),
  )

  expectType<number>(
    // $ExpectError
    pP
      .prop('a')
      .index(1)
      .getValue(),
  )
}

// DictAtom > BoxAtom<string> | BoxAtom<number>
;() => {
  const a: DictAtom<{a: BoxAtom<string> | BoxAtom<number>}> = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  expectType<number | string>(p.prop('a').getValue())
  expectType<number | string>(pP.prop('a').getValue())

  // $ExpectError
  expectType<number>(p.prop('a').getValue())
  // $ExpectError
  expectType<number>(pP.prop('a').getValue())

  // $ExpectError
  expectType<string>(p.prop('a').getValue())
  // $ExpectError
  expectType<string>(pP.prop('a').getValue())
}

// DictAtom<BoxAtom<string>> | DictAtom<BoxAtom<number>>
;() => {
  const a:
    | DictAtom<{a: BoxAtom<string>}>
    | DictAtom<{a: BoxAtom<number>}> = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  expectType<number | string>(p.prop('a').getValue())
  expectType<number | string>(pP.prop('a').getValue())

  // $ExpectError
  expectType<number>(p.prop('a').getValue())
  // $ExpectError
  expectType<number>(pP.prop('a').getValue())

  // @todo $ExpectError
  expectType<string>(p.prop('a').getValue())

  // @todo $ExpectError
  expectType<string>(pP.prop('a').getValue())
}

// DictAtom<BoxAtom<string> | BoxAtom<string>>
;() => {
  const a: DictAtom<{a: BoxAtom<string>} | {a: BoxAtom<number>}> = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  expectType<number | string>(p.prop('a').getValue())
  expectType<number | string>(pP.prop('a').getValue())

  // $ExpectError
  expectType<number>(p.prop('a').getValue())
  // $ExpectError
  expectType<number>(pP.prop('a').getValue())

  // $ExpectError
  expectType<string>(p.prop('a').getValue())
  // $ExpectError
  expectType<string>(pP.prop('a').getValue())
}

// DictAtom<BoxAtom & BoxAtom>
;() => {
  const a: DictAtom<{a: BoxAtom<string>} & {b: BoxAtom<number>}> = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  expectType<string>(p.prop('a').getValue())
  expectType<string>(pP.prop('a').getValue())
  expectType<number>(p.prop('b').getValue())
  expectType<number>(pP.prop('b').getValue())

  // $ExpectError
  expectType<number>(p.prop('a').getValue())
  // $ExpectError
  expectType<number>(pP.prop('a').getValue())

  // $ExpectError
  expectType<string>(p.prop('b').getValue())
  // $ExpectError
  expectType<string>(pP.prop('b').getValue())
}

// DictAtom<BoxAtom> & DictAtom<BoxAtom>
;() => {
  const a: DictAtom<{a: BoxAtom<string>}> &
    DictAtom<{b: BoxAtom<number>}> = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  // @ts-ignore @todo
  expectType<string>(p.prop('a').getValue())
  expectType<string>(pP.prop('a').getValue())

  expectType<number>(p.prop('b').getValue())
  // @ts-ignore @todo
  expectType<number>(pP.prop('b').getValue())

  // $ExpectError
  expectType<number>(p.prop('a').getValue())

  // $ExpectError
  expectType<number>(pP.prop('a').getValue())

  // $ExpectError
  expectType<string>(p.prop('b').getValue())
  // $ExpectError
  expectType<string>(pP.prop('b').getValue())
}

// DictAtom<BoxAtom<BoxAtom<string>> | BoxAtom<BoxAtom<string>>>
;() => {
  const a: DictAtom<
    {a: DictAtom<{aa: BoxAtom<string>}>} | {a: DictAtom<{aa: BoxAtom<number>}>}
  > = _any
  const p = a.pointer()
  const pP = a.derivedDict().pointer()

  expectType<DictAtom<{aa: BoxAtom<string | number>}>>(p.prop('a').getValue())
  expectType<AbstractDerivedDict<{aa: BoxAtom<string | number>}>>(
    pP.prop('a').getValue(),
  )
  // $ExpectError
  expectType<DictAtom<{aa: BoxAtom<string>}>>(p.prop('a').getValue())
  expectType<AbstractDerivedDict<{aa: BoxAtom<string>}>>(
    // $ExpectError
    pP.prop('a').getValue(),
  )
  // $ExpectError
  expectType<DictAtom<{aa: BoxAtom<number>}>>(p.prop('a').getValue())
  expectType<AbstractDerivedDict<{aa: BoxAtom<number>}>>(
    // $ExpectError
    pP.prop('a').getValue(),
  )

  expectType<number | string>(
    p
      .prop('a')
      .prop('aa')
      .getValue(),
  )

  expectType<number | string>(
    pP
      .prop('a')
      .prop('aa')
      .getValue(),
  )

  expectType<number>(
    // $ExpectError
    p
      .prop('a')
      .prop('aa')
      .getValue(),
  )
  expectType<number>(
    // $ExpectError
    pP
      .prop('a')
      .prop('aa')
      .getValue(),
  )
  expectType<string>(
    // $ExpectError
    p
      .prop('a')
      .prop('aa')
      .getValue(),
  )
  expectType<string>(
    // $ExpectError
    pP
      .prop('a')
      .prop('aa')
      .getValue(),
  )
}
