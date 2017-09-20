// @flow
import type IAtom from './Atom'

type IsAtomFn =
  (<V: IAtom>(v: V) => true) &
  (<V>(v: V) => false)

const isAtom = (v: mixed) => {
  return typeof v === 'object' && v !== null && v.isAtom === true
}

export default ((isAtom: $IntentionalAny): IsAtomFn)