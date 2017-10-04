// @flow
import type {IDerivation} from '../types'
import Emitter from '$shared/DataVerse/utils/Emitter'
// import lodashMapValues from 'lodash/mapValues'
import type {IDerivedMap, ChangeType} from './types'
import DerivedMap from './DerivedMap'
import noop from 'lodash/noop'

export class MapValues extends DerivedMap implements IDerivedMap<$FixMe> {
  _changeEmitter: Emitter<ChangeType<$FixMe>>
  _source: IDerivedMap<$FixMe>
  _fn: $FixMe
  _untapFromSourceChanges: Function

  constructor<O: {}, K: $Keys<O>, V: $ElementType<O, K>, T, FN: (V, K) => $FixMe>(source: IDerivedMap<O>, fn: FN): IDerivedMap<$FixMe> {
    super()
    this._source = source
    this._fn = fn
    this._untapFromSourceChanges = noop
    return this
  }

  _reactToHavingTappers() {
    this._untapFromSourceChanges = this._source.changes().tap((c) => {
      this._reactToChangeFromSource(c)
    })
  }

  _reactToNotHavingTappers() {
    this._untapFromSourceChanges()
    this._untapFromSourceChanges = noop
  }

  _reactToChangeFromSource(c: ChangeType<$FixMe>) {
    this._changeEmitter.emit(c)
  }

  prop<K: $Keys<$FixMe>>(k: K): IDerivation<$FixMe> {
    return this._source.prop(k).map(this._fn)
  }

  keys() {
    return this._source.keys()
  }

  changes() {
    return this._changeEmitter.tappable
  }
}


const mapValues = <O: {}, K: $Keys<O>, V: $ElementType<O, K>, T, FN: (V, K) => $FixMe>(source: IDerivedMap<O>, fn: FN): IDerivedMap<$FixMe> => {
  return new MapValues(source, fn)
}

export default mapValues