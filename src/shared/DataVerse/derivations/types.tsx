import Tappable from '$shared/DataVerse/utils/Tappable'
import {ITicker} from '$shared/DataVerse/Ticker'

interface Dependent {
  _youMayNeedToUpdateYourself(): void
}

export interface AbstractDerivation<V> {
  _id: number

  // _changeEmitter: Emitter<V>,
  _dependents: Set<AbstractDerivation<$IntentionalAny>>
  _dependencies: Set<AbstractDerivation<$IntentionalAny>>

  getValue: () => V
  _recalculate: () => V
  _keepUptodate: () => void
  _stopKeepingUptodate: () => void
  _youMayNeedToUpdateYourself: (
    msgComingFrom: AbstractDerivation<$IntentionalAny>,
  ) => void

  _addDependent(d: Dependent): void
  _removeDependent(d: Dependent): void
  _addDependency(d: AbstractDerivation<$IntentionalAny>): void
  _removeDependency(d: AbstractDerivation<$IntentionalAny>): void
  _tick(): void

  changes(ticker: ITicker): Tappable<V>
  tapImmediate(ticker: ITicker, fn: ((v: V) => void)): () => void

  map<R, Fn extends (v: V) => R>(fn: Fn): AbstractDerivation<R>
  flatMap<R, T extends AbstractDerivation<R>, Fn extends (v: V) => R | T>(
    fn: Fn,
  ): AbstractDerivation<R>
  toJS(): AbstractDerivation<$FixMe>

  flatten(): AbstractDerivation<$FixMe> // $Call<FlattenDeepFn, AbstractDerivation<V>, 1>;
  inPointer: boolean

  flattenDeep<D extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(
    depth: D,
  ): AbstractDerivation<$FixMe> // $Call<FlattenDeepFn, P, D>;
}

export type Changes<V> = () => Tappable<V>
