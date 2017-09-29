// @flow
import Derivation from '../Derivation'
import type {IArrayAtom, IAtom} from '$shared/DataVerse'
import type {IDerivation} from '../types'

const noop = () => {}

export class DerivationOfAnIndexOfAnArrayAtom<V: IAtom> extends Derivation implements IDerivation<V> {
  getValue: () => V

  _arrayAtom: IArrayAtom<V>
  _untapFromMapAtomChanges: Function
  _index: number

  constructor(arrayAtom: IArrayAtom<V>, index: number): IDerivation<V> {
    super()
    this._arrayAtom = arrayAtom
    this._index = index
    this._untapFromMapAtomChanges = noop
    return this
  }

  _recalculate(): $FixMe {
    return this._arrayAtom.index((this._index: $FixMe))
  }

  _keepUptodate() {
    // this.getValue()
    this._untapFromMapAtomChanges = this._arrayAtom.changes().tap((changes) => {
      if (changes.startIndex > this._index) return
      const countOfAddedItems = changes.addedRefs.length - changes.deleteCount
      if (countOfAddedItems === 0) {
        if (changes.startIndex + changes.deleteCount >= this._index) {
          this._youMayNeedToUpdateYourself(this)
        }
      } else {
        this._youMayNeedToUpdateYourself(this)
      }
    })
  }

  _stopKeepingUptodate() {
    this._untapFromMapAtomChanges()
    this._untapFromMapAtomChanges = noop
  }
}

export default function deriveFromIndexOfArrayAtom<V: IAtom, A: IArrayAtom<V>>(a: A, index: number): IDerivation<V> {
  return new DerivationOfAnIndexOfAnArrayAtom(a, index)
}