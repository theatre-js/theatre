import AbstractDerivedDict, {
  DerivedDictChangeType,
  PropOfADD,
} from './AbstractDerivedDict'
import noop from '$shared/utils/noop'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'

type FunctionMapping<V, Fn extends (v: V) => $IntentionalAny> = Fn extends (
  v: V,
) => infer R
  ? R
  : any

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

  // @ts-ignore @todo
  prop<K extends keyof this['_o']>(
    key: K,
  ): AbstractDerivation<PropOfADD<this['_o'][K]>> {
    return this._source
      .pointer()
      // @ts-ignore @todo
      .prop(key)
      .flatMap(this._fn) as $IntentionalAny
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
