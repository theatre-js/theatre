// @flow
import Derivation from './Derivation'
import type {IDerivation} from './types'

export class FlattenDeepDerivation extends Derivation implements IDerivation<$FixMe> {
  _stackOfDependencies: Array<IDerivation<$IntentionalAny>>
  _updateNeededFromIndex: number
  _maxDepth: number

  constructor(depDerivation: IDerivation<$FixMe>, maxDepth: number = 200): IDerivation<$FixMe> {
    super()
    this._stackOfDependencies = [depDerivation]
    this._maxDepth = maxDepth
    this._updateNeededFromIndex = 0

    this._addDependency(depDerivation)
    // depDerivation._addDependent(this)
    return this
  }

  _recalculate() {
    const updateFromIndex = this._updateNeededFromIndex === -1 ? 0 : this._updateNeededFromIndex
    this._updateNeededFromIndex = -1

    for (let i = this._stackOfDependencies.length - 1; i > updateFromIndex; i--) {
      const d = this._stackOfDependencies.pop()
      this._removeDependency(d)
    }

    let i = updateFromIndex
    while(true) {
      const currentDepth = i
      const topDerivation = this._stackOfDependencies[i]
      const innerValue = topDerivation.getValue()
      if (currentDepth === this._maxDepth) {
        return innerValue
      }

      if (innerValue instanceof Derivation) {
        this._stackOfDependencies.push(innerValue)
        this._addDependency(innerValue)
      } else {
        return innerValue
      }
      i++
    }
  }

  _youMayNeedToUpdateYourself(msgComingFrom: IDerivation<$IntentionalAny>) {
    const indexOfDep = this._stackOfDependencies.indexOf((msgComingFrom: $FixMe))

    if (indexOfDep === -1) {
      throw Error(`got a _youMayNeedToUpdateYourself() from a dep that's not in the stack`)
    }

    if (this._updateNeededFromIndex === -1) {
      this._updateNeededFromIndex = indexOfDep
      Derivation.prototype._youMayNeedToUpdateYourself.call(this, msgComingFrom)
    } else if (this._updateNeededFromIndex <= indexOfDep) {
      return
    } else {
      this._updateNeededFromIndex = indexOfDep
      Derivation.prototype._youMayNeedToUpdateYourself.call(this, msgComingFrom)
    }
  }

  _keepUptodate() {
    this.getValue()
  }
}

export default function flattenDeep<V>(depDerivation: IDerivation<V>, maxDepth: number = 200): IDerivation<$FixMe> {
  return new FlattenDeepDerivation(depDerivation, maxDepth)
}