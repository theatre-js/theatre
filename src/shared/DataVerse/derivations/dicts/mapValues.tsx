import AbstractDerivedDict, {DerivedDictChangeType} from './AbstractDerivedDict'
import noop from 'lodash/noop'
import AbstractDerivation from '$src/shared/DataVerse/derivations/AbstractDerivation'

type FunctionMapping<V, Fn extends (v: V) => $IntentionalAny> = Fn extends (v: V) => infer R ? R : any

export class MapValues<
  S,
  Fn extends (v: S[keyof S]) => $IntentionalAny
> extends AbstractDerivedDict<{[K in keyof S]: FunctionMapping<S[K], Fn>}> {
  _source: AbstractDerivedDict<S>
  _fn: Fn
  _untapFromSourceChanges: () => void

  constructor(source: AbstractDerivedDict<S>, fn: Fn) {
    super()
    this._source = source
    this._fn = fn
    this._untapFromSourceChanges = noop
    return this
  }

  _reactToHavingTappers() {
    this._untapFromSourceChanges = this._source.changes().tap(c => {
      this._reactToChangeFromSource(c)
    })
  }

  _reactToNotHavingTappers() {
    this._untapFromSourceChanges()
    this._untapFromSourceChanges = noop
  }

  _reactToChangeFromSource(c: DerivedDictChangeType<S>) {
    // @todo we should defer these until Ticker.tick(), but this will do for now
    this._changeEmitter.emit(c)
  }

  prop<K extends keyof $FixMe>(k: K): AbstractDerivation<$FixMe> {
    return this._source.pointer().prop(k).flatMap(this._fn)
  }

  keys() {
    return this._source.keys()
  }
}

const mapValues = <S extends {}, Fn extends (v: S[keyof S]) => $IntentionalAny>(
  source: AbstractDerivedDict<S>,
  fn: Fn,
) => {
  return new MapValues(source, fn)
}

export default mapValues
