import AbstractDerivation from './AbstractDerivation'

const _any: $IntentionalAny = null

// map
;() => {
  const a: AbstractDerivation<string> = _any

  // $ExpectType AbstractDerivation<number>
  a.map((s: string) => 10)

  // $ExpectError
  a.map((s: number) => 10)
}

// flatten
;() => {
  const a: AbstractDerivation<AbstractDerivation<string>> = _any
  
  // ExpectType AbstractDerivation<string>
  a.flatten()
  
  a.flatten() as AbstractDerivation<string>
  
  const b: AbstractDerivation<string> = _any

  // $ExpectType AbstractDerivation<string>
  b.flatten()

  // $ExpectError
  b.flatten() as AbstractDerivation<number>
}

// flatMap()
;() => {
  const a: AbstractDerivation<string> = _any

  // okay
  a.flatMap((s: string) => {})

  // $ExpectError
  a.flatMap((s: number) => {})

  // $ExpectType AbstractDerivation<number>
  a.flatMap((s): AbstractDerivation<number> => _any)

  // $ExpectType AbstractDerivation<number>
  a.flatMap((s): number => _any)
}

// flattenDeep() @todo