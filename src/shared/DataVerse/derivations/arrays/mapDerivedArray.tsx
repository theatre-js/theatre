// @flow
import noop from 'lodash/noop'
import AbstractDerivedArray from './AbstractDerivedArray'
import type {IDerivedArray} from './types'

export class MappedDerivedArray extends AbstractDerivedArray
  implements IDerivedArray<$FixMe> {
  _untapFromSourceChanges: Function

  constructor(source: $FixMe, fn: $FixMe): IDerivedArray<$FixMe> {
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

  _reactToChangeFromSource(c: $FixMe) {
    this._changeEmitter.emit(c)
  }

  index(i: number): $FixMe {
    return this._fn(this._source.pointer().index(i))
  }

  length() {
    return this._source.length()
  }
}

export default function mapDerivedArray<T, V, Fn: T => V>(
  source: IDerivedArray<T>,
  fn: Fn,
): IDerivedArray<V> {
  return new MappedDerivedArray(source, fn)
}
