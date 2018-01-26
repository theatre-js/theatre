// @flow
import noop from 'lodash/noop'
import AbstractDerivedArray from './AbstractDerivedArray'
import AbstractDerivation from '$src/shared/DataVerse/derivations/AbstractDerivation'

export class MappedDerivedArray<T, V> extends AbstractDerivedArray<V> {
  _untapFromSourceChanges: Function

  constructor(
    readonly _source: AbstractDerivedArray<T>,
    readonly _fn: (t: AbstractDerivation<T>) => AbstractDerivation<V>,
  ) {
    super()
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

export default function mapDerivedArray<
  T,
  V,
  Fn extends (t: AbstractDerivation<T>) => AbstractDerivation<V>
>(source: AbstractDerivedArray<T>, fn: Fn) {
  return new MappedDerivedArray(source, fn)
}
