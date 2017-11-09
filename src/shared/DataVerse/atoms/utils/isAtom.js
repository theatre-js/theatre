// @flow
import type {IAtom} from './AbstractAtom'

type IsAtomFn = (<V: IAtom>(v: V) => true) & (<V>(v: V) => false)

const isAtom = (v: mixed) => {
  return typeof v === 'object' && v !== null && v.isAtom === 'True'
}

export default ((isAtom: $IntentionalAny): IsAtomFn)
