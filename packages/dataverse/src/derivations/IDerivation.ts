import type Ticker from '../Ticker'
import type {$IntentionalAny, VoidFn} from '../types'
import type Tappable from '../utils/Tappable'

type IDependent = (msgComingFrom: IDerivation<$IntentionalAny>) => void
export interface IDerivation<V> {
  isDerivation: true
  isHot: boolean
  changes(ticker: Ticker): Tappable<V>

  changesWithoutValues(): Tappable<void>
  keepHot(): VoidFn
  tapImmediate(ticker: Ticker, fn: (cb: V) => void): VoidFn
  addDependent(d: IDependent): void
  removeDependent(d: IDependent): void

  getValue(): V

  map<T>(fn: (v: V) => T): IDerivation<T>

  flatMap<R>(
    fn: (v: V) => R,
  ): IDerivation<R extends IDerivation<infer T> ? T : R>
}

export function isDerivation(d: any): d is IDerivation<unknown> {
  return d && d.isDerivation && d.isDerivation === true
}
