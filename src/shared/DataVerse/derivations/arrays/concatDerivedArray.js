// @flow
import type {IDerivedArray} from './types'
import AbstractDerivedArray from './AbstractDerivedArray'

export class ConcatenatedDerivedArray<V> extends AbstractDerivedArray
  implements IDerivedArray<V> {
  _left: IDerivedArray<V>
  _right: IDerivedArray<V>

  constructor(
    left: IDerivedArray<V>,
    right: IDerivedArray<V>,
  ): IDerivedArray<V> {
    super()
    this._left = left
    this._right = right
    return this
  }
}

export default function concatDerivedArray<V>(
  left: IDerivedArray<V>,
  right: IDerivedArray<V>,
): IDerivedArray<V> {
  return new ConcatenatedDerivedArray(left, right)
}
