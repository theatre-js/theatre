import {ArrayAtom} from '$src/shared/DataVerse/atoms/array'
import {PointerDerivation} from './pointer'
import {BoxAtom} from '$src/shared/DataVerse/atoms/box'
import {DictAtom} from '$src/shared/DataVerse/atoms/dict'
import AbstractDerivedDict from '$src/shared/DataVerse/derivations/dicts/AbstractDerivedDict'
import {PropOfADD} from './dicts/AbstractDerivedDict'

export type DerivationTypeOfPointerType<O> = {
  '1': O extends BoxAtom<infer T> ? T : O
}[O extends number ? '1' : '1']

export type IndexOfPointer<O> = {
  '1': O extends ArrayAtom<infer T>
    ? PointerDerivation<T>
    : PointerDerivation<void>
}[O extends number ? '1' : '1']

export type PropOfPointer<O, K> = {
  '1': O extends DictAtom<infer T>
    ? PointerDerivation<K extends keyof T ? T[K] : void>
    : O extends AbstractDerivedDict<infer OO>
      ? PointerDerivation<K extends keyof OO ? PropOfADD<OO[K]> : void>
      : PointerDerivation<void>
}[O extends number ? '1' : '1']

// type EnsureNoAtoms<V> =
//   V extends DictAtom<infer O> ? AbstractDerivedDict<V> :
//   V
// V extends ArrayAtom<infer T>
