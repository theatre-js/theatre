import {ArrayAtom} from '$shared/DataVerse/deprecated/atoms/arrayAtom'
import {PointerDerivation} from './pointer'
import {BoxAtom} from '$shared/DataVerse/deprecated/atoms/boxAtom'
import {DictAtom} from '$shared/DataVerse/deprecated/atoms/dictAtom'
import AbstractDerivedDict from '$shared/DataVerse/derivations/dicts/AbstractDerivedDict'
import {PropOfADD} from './dicts/AbstractDerivedDict'
import DerivedClassInstance from '$shared/DataVerse/deprecated/derivedClass/DerivedClassInstance'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import AbstractDerivedArray from '$shared/DataVerse/deprecated/atomDerivations/arrays/AbstractDerivedArray'

export type DerivationTypeOfPointerType<O> = {
  '1': O extends BoxAtom<infer T>
    ? T
    : O extends PointerDerivation<infer V>
      ? DerivationTypeOfPointerType<V>
      : O extends AbstractDerivation<infer T> ? T : O
}[O extends number ? '1' : '1']

export type PointerKeys<O> = {
  '1': O extends PointerDerivation<infer T>
    ? PointerKeys<T>
    : O extends DictAtom<infer T>
      ? keyof T
      : O extends AbstractDerivedDict<infer T>
        ? keyof T
        : O extends DerivedClassInstance<infer T> ? keyof T : never
}[O extends number ? '1' : '1']

export type IndexOfPointer<O> = {
  '1': O extends ArrayAtom<infer T>
    ? PointerDerivation<T>
    : O extends AbstractDerivedArray<infer T>
      ? PointerDerivation<PropOfADD<T>>
      : O extends PointerDerivation<infer T>
        ? IndexOfPointer<T>
        : PointerDerivation<undefined>
}[O extends number ? '1' : '1']

export type PropOfPointer<O, K> = {
  '1': O extends PointerDerivation<infer T>
    ? PropOfPointer<T, K>
    : O extends DictAtom<infer T>
      ? PointerDerivation<
          K extends keyof T
            ? T[K]
            : T extends {[key: string]: infer F} ? F : undefined
        >
      : O extends AbstractDerivedDict<infer OO>
        ? PointerDerivation<K extends keyof OO ? PropOfADD<OO[K]> : undefined>
        : O extends DerivedClassInstance<infer OO>
          ? K extends keyof OO
            ? PointerDerivation<OO[K]>
            : PointerDerivation<undefined>
          : PointerDerivation<undefined>
}[O extends number ? '1' : '1']

// type EnsureNoAtoms<V> =
//   V extends DictAtom<infer O> ? AbstractDerivedDict<V> :
//   V
// V extends ArrayAtom<infer T>
