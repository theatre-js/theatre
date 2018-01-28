import {AbstractDerivation} from '../types'
import Emitter from '$shared/DataVerse/utils/Emitter'
// import lodashMapValues from 'lodash/mapValues'
import {IDerivedDict, ChangeType} from './types'
import DerivedDict from './AbstractDerivedDict'
import noop from 'lodash/noop'

export class MapValues extends DerivedDict implements IDerivedDict<$FixMe> {
  _changeEmitter: Emitter<ChangeType<$FixMe>>
  _source: IDerivedDict<$FixMe>
  _fn: $FixMe
  _untapFromSourceChanges: Function

  constructor(source: IDerivedDict<O>, fn: FN) {
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

  _reactToChangeFromSource(c: ChangeType<$FixMe>) {
    // @todo we should defer these until D.Ticker.tick(), but this will do for now
    this._changeEmitter.emit(c)
  }

  prop<K extends keyof $FixMe>(k: K): AbstractDerivation<$FixMe> {
    return this._fn(this._source.pointer().prop(k))
  }

  keys() {
    return this._source.keys()
  }

  changes() {
    return this._changeEmitter.tappable
  }
}

const mapValues = <
  O,
  K extends keyof O,
  V extends O[K],
  FN extends (v: V, k: K) => $FixMe
>(
  source: IDerivedDict<O>,
  fn: FN,
): IDerivedDict<$FixMe> => {
  return new MapValues(source, fn)
}

export default mapValues
