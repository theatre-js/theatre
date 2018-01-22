import Tappable from '$shared/DataVerse/utils/Tappable'
import {ITicker} from '$shared/DataVerse/Ticker'

interface Dependent {
  _youMayNeedToUpdateYourself(): void
}

export interface IDerivation<V> {
  _id: number

  // _changeEmitter: Emitter<V>,
  _dependents: Set<IDerivation<$IntentionalAny>>
  _dependencies: Set<IDerivation<$IntentionalAny>>

  getValue: () => V
  _recalculate: () => V
  _keepUptodate: () => void
  _stopKeepingUptodate: () => void
  _youMayNeedToUpdateYourself: (
    msgComingFrom: IDerivation<$IntentionalAny>,
  ) => void

  _addDependent(d: Dependent): void
  _removeDependent(d: Dependent): void
  _addDependency(d: IDerivation<$IntentionalAny>): void
  _removeDependency(d: IDerivation<$IntentionalAny>): void
  _tick(): void

  changes(ticker: ITicker): Tappable<V>
  tapImmediate(ticker: ITicker, fn: ((v: V) => void)): () => void

  map<R, Fn extends (v: V) => R>(fn: Fn): IDerivation<R>
  flatMap<R, T extends IDerivation<R>, Fn extends (v: V) => R | T>(
    fn: Fn,
  ): IDerivation<R>
  toJS(): IDerivation<$FixMe>

  flatten(): IDerivation<$FixMe> // $Call<FlattenDeepFn, IDerivation<V>, 1>;
  inPointer: boolean

  flattenDeep<D extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(
    depth: D,
  ): IDerivation<$FixMe> // $Call<FlattenDeepFn, P, D>;
}

export type Changes<V> = () => Tappable<V>
