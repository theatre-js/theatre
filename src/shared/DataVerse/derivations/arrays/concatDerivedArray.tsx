import AbstractDerivedArray from '$shared/DataVerse/derivations/arrays/AbstractDerivedArray'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'

export class ConcatenatedDerivedArray<V> extends AbstractDerivedArray<V> {
  _left: AbstractDerivedArray<V>
  _right: AbstractDerivedArray<V>

  constructor(left: AbstractDerivedArray<V>, right: AbstractDerivedArray<V>) {
    super()
    this._left = left
    this._right = right
    return this
  }

  length() {
    return this._left.length() + this._right.length()
  }

  // @ts-ignore @todo
  index(i: number): AbstractDerivation<V> {
    throw new Error('Method not implemented.')
  }
  _reactToHavingTappers(): void {
    throw new Error('Method not implemented.')
  }
  _reactToNotHavingTappers(): void {
    throw new Error('Method not implemented.')
  }
}

export default function concatDerivedArray<V>(
  left: AbstractDerivedArray<V>,
  right: AbstractDerivedArray<V>,
): ConcatenatedDerivedArray<V> {
  return new ConcatenatedDerivedArray(left, right)
}
