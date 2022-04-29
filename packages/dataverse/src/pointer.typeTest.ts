import type {Pointer, UnindexablePointer} from './pointer'
import type {$IntentionalAny} from './types'

const nominal = Symbol()
type Nominal<Name> = string & {[nominal]: Name}

type Key = Nominal<'key'>
type Id = Nominal<'id'>

type IdObject = {
  inner: true
}

type KeyObject = {
  inner: {
    byIds: Partial<Record<Id, IdObject>>
  }
}

type NestedNominalThing = {
  optional?: true
  byKeys: Partial<Record<Key, KeyObject>>
}

interface TypeError<M> {}

type Debug<T extends 0> = T
type IsTrue<T extends true> = T
type IsFalse<F extends false> = F
type IsExtends<F, R extends F> = F
type IsExactly<F, R extends F> = F extends R
  ? true
  : TypeError<[F, 'does not extend', R]>

function test() {
  const p = todo<Pointer<NestedNominalThing>>()
  const key1 = todo<Key>()
  const id1 = todo<Id>()

  type A = UnindexablePointer[typeof key1]
  type BaseChecks = [
    IsExtends<any, any>,
    IsExtends<undefined | 1, undefined>,
    IsExtends<string, Key>,
    IsTrue<IsExactly<UnindexablePointer[typeof key1], Pointer<undefined>>>,
    IsTrue<
      IsExactly<Pointer<undefined | true>['...']['...'], Pointer<undefined>>
    >,
    IsTrue<
      IsExactly<
        Pointer<Record<Key, true | undefined>>[Key],
        Pointer<true | undefined>
      >
    >,
    IsTrue<IsExactly<Pointer<undefined>[Key], Pointer<undefined>>>,
    // Debug<Pointer<undefined | Record<string, true>>[Key]>,
    IsTrue<IsExactly<Pointer<Record<string, true>>[string], Pointer<true>>>,
    IsTrue<
      IsExactly<
        Pointer<undefined | Record<string, true>>[string],
        Pointer<true | undefined>
      >
    >,
    IsTrue<
      IsExactly<
        Pointer<undefined | Record<Key, true>>[Key],
        Pointer<true | undefined>
      >
    >,
    // Debug<Pointer<undefined | true>['...']['...']>,
    // IsFalse<any extends Pointer<undefined | true> ? true : false>,
    // what extends what
    IsTrue<1 & undefined extends undefined ? true : false>,
    IsFalse<1 | undefined extends undefined ? true : false>,
  ]

  t<Pointer<undefined | true>>() //
    .isExactly(p.optional).ok

  t<Pointer<undefined | KeyObject>>() //
    .isExactly(p.byKeys[key1]).ok

  t<Pointer<undefined | KeyObject['inner']>>() //
    .isExactly(p.byKeys[key1].inner).ok

  t<Pointer<undefined | IdObject>>() //
    .isExactly(p.byKeys[key1].inner.byIds[id1]).ok

  p.byKeys[key1]
}

function todo<T>(hmm?: TemplateStringsArray): T {
  return null as $IntentionalAny
}
function t<T>(): {
  isExactly<R extends T>(
    hmm: R,
  ): T extends R
    ? // any extends R
      //   ? TypeError<[R, 'is any']>
      //   :
      {ok: true}
    : TypeError<[T, 'does not extend', R]>
} {
  return {isExactly: (hmm) => hmm as $IntentionalAny}
}
