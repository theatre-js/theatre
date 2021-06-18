import type {$IntentionalAny} from '../types'
import type {IDerivation} from './IDerivation'

const _any: $IntentionalAny = null

// map
;() => {
  const a: IDerivation<string> = _any

  // $ExpectType IDerivation<number>
  // eslint-disable-next-line unused-imports/no-unused-vars-ts
  a.map((s: string) => 10)

  // @ts-expect-error
  // eslint-disable-next-line unused-imports/no-unused-vars-ts
  a.map((s: number) => 10)
}

// flatMap()
/* eslint-disable unused-imports/no-unused-vars-ts */
;() => {
  const a: IDerivation<string> = _any

  // okay
  a.flatMap((s: string) => {})

  // @ts-expect-error TypeTest
  a.flatMap((s: number) => {})

  // $ExpectType IDerivation<number>
  a.flatMap((s): IDerivation<number> => _any)

  // $ExpectType IDerivation<number>
  a.flatMap((s): number => _any)
}
/* eslint-enable unused-imports/no-unused-vars-ts */
