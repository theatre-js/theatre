// @flow
import type {default as Emitter} from '$shared/DataVerse/utils/Emitter'
import type {default as Tappable} from '$shared/DataVerse/utils/Tappable'
import type {default as Context} from '$shared/DataVerse/Context'

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

  map<T>(fn: (oldVal: V) => T): IDerivation<T>,
  flatMap<T, P>(fn: (oldVal: V) => IDerivation<T> | P): IDerivation<T | P>,
  flatten(): IDerivation<$FixMe>,
  flattenDeep(levels?: number): IDerivation<$FixMe>,
}

export type Changes<V> = () => Tappable<V>