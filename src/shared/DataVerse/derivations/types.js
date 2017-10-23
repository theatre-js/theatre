// @flow
import type {default as Emitter} from '$shared/DataVerse/utils/Emitter'
import type {default as Tappable} from '$shared/DataVerse/utils/Tappable'
import type {default as Context} from '$shared/DataVerse/Context'
import {type FlattenDeepFn} from './flattenDeep'

export interface IDerivation<V> {
  _id: number,

  _changeEmitter: Emitter<V>,
  _dependents: Set<IDerivation<$IntentionalAny>>,
  _dependencies: Set<IDerivation<$IntentionalAny>>,

  getValue: () => V,
  +_recalculate: () => V,
  +_keepUptodate: () => void,
  +_stopKeepingUptodate: () => void,
  +_youMayNeedToUpdateYourself: (msgComingFrom: IDerivation<$IntentionalAny>) => void,
  setDataVerseContext: (Context) => IDerivation<V>,

  _addDependent(IDerivation<$IntentionalAny>): void,
  _removeDependent(IDerivation<$IntentionalAny>): void,
  _addDependency(IDerivation<$IntentionalAny>): void,
  _removeDependency(IDerivation<$IntentionalAny>): void,
  _tick(): void,

  changes(): Tappable<V>,
  tapImmediate((V) => void): () => void,

  map<R, Fn: (V) => R>(Fn): IDerivation<R>,
  flatMap<R, T: IDerivation<R>, Fn: (V) => R | T>(fn: Fn): IDerivation<R>,
  // flatMap<R, Fn: (V) => R>(fn: Fn): IDerivation<R>,
  // flatMap<R, T: IDerivation<R>, Fn: (V) => T>(fn: Fn): IDerivation<R>,
  // flatMap: (
  //   & (<R, T: IDerivation<R>, Fn: (V) => T>(fn: Fn) => IDerivation<R>)
  //   & (<R, Fn: (V) => R>(fn: Fn) => IDerivation<R>)
  //   ),
  flatten(): $Call<FlattenDeepFn, IDerivation<V>, 1>,

  // This is byggy. Flow can't handle all these cases properly
  flattenDeep<D: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7, P: IDerivation<V>>(depth: D): $Call<FlattenDeepFn, P, D>,
  // flattenDeep: (
  //   (<Ret: V, D: 0>(D) => IDerivation<Ret>) &

  //   (<V0: V, Ret, V2: IDerivation<Ret>, V1: IDerivation<V2> & V0, D: 1>(D) => IDerivation<Ret>) &
  //   (<Ret: V, D: 1>(D) => IDerivation<Ret>) &

  //   (<D: 3, Ret, V1: IDerivation<V>, V2: IDerivation<V1>, V3: IDerivation<V2>, V4: IDerivation<Ret>>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V4: IDerivation<Ret>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 3>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 3>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V2: IDerivation<Ret>, V1: IDerivation<V2> & V0, D: 3>(D) => IDerivation<Ret>) &
  //   (<Ret: V, D: 3>(D) => IDerivation<Ret>) &

  //   (<V0: V, Ret, V4: IDerivation<Ret>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 3>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 3>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V2: IDerivation<Ret>, V1: IDerivation<V2> & V0, D: 3>(D) => IDerivation<Ret>) &
  //   (<Ret: V, D: 3>(D) => IDerivation<Ret>) &

  //   (<V0: V, Ret, V5: IDerivation<Ret>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 4>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V4: IDerivation<Ret>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 4>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 4>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V2: IDerivation<Ret>, V1: IDerivation<V2> & V0, D: 4>(D) => IDerivation<Ret>) &
  //   (<Ret: V, D: 4>(D) => IDerivation<Ret>) &

  //   (<V0: V, Ret, V6: IDerivation<Ret>, V5: IDerivation<V6>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 5>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V5: IDerivation<Ret>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 5>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V4: IDerivation<Ret>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 5>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 5>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V2: IDerivation<Ret>, V1: IDerivation<V2> & V0, D: 5>(D) => IDerivation<Ret>) &
  //   (<Ret: V, D: 5>(D) => IDerivation<Ret>) &

  //   (<V0: V, Ret, V7: IDerivation<Ret>, V6: IDerivation<V7>, V5: IDerivation<V6>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 6>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V6: IDerivation<Ret>, V5: IDerivation<V6>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 6>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V5: IDerivation<Ret>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 6>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V4: IDerivation<Ret>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 6>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 6>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V2: IDerivation<Ret>, V1: IDerivation<V2> & V0, D: 6>(D) => IDerivation<Ret>) &
  //   (<Ret: V, D: 6>(D) => IDerivation<Ret>) &

  //   (<V0: V, Ret, V8: IDerivation<Ret>, V7: IDerivation<V8>, V6: IDerivation<V7>, V5: IDerivation<V6>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 7>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V7: IDerivation<Ret>, V6: IDerivation<V7>, V5: IDerivation<V6>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 7>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V6: IDerivation<Ret>, V5: IDerivation<V6>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 7>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V5: IDerivation<Ret>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 7>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V4: IDerivation<Ret>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 7>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2> & V0, D: 7>(D) => IDerivation<Ret>) &
  //   (<V0: V, Ret, V2: IDerivation<Ret>, V1: IDerivation<V2> & V0, D: 7>(D) => IDerivation<Ret>) &
  //   (<Ret: V, D: 7>(D) => IDerivation<Ret>) &

  //   (<Ret, V8: IDerivation<Ret>, V7: IDerivation<V8>, V6: IDerivation<V7>, V5: IDerivation<V6>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2>>(empty) => IDerivation<Ret>) &
  //   (<Ret, V7: IDerivation<Ret>, V6: IDerivation<V7>, V5: IDerivation<V6>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2>>(empty) => IDerivation<Ret>) &
  //   (<Ret, V6: IDerivation<Ret>, V5: IDerivation<V6>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2>>(empty) => IDerivation<Ret>) &
  //   (<Ret, V5: IDerivation<Ret>, V4: IDerivation<V5>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2>>(empty) => IDerivation<Ret>) &
  //   (<Ret, V4: IDerivation<Ret>, V3: IDerivation<V4>, V2: IDerivation<V3>, V1: IDerivation<V2>>(empty) => IDerivation<Ret>) &
  //   (<Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2>>(empty) => IDerivation<Ret>) &
  //   (<Ret, V2: IDerivation<Ret>, V1: IDerivation<V2>>(empty) => IDerivation<Ret>) &
  //   (<Ret: V>() => IDerivation<Ret>)
  // ),
}


export type Changes<V> = () => Tappable<V>