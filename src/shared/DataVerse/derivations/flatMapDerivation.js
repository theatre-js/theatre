// @flow
import AbstractDerivation from './AbstractDerivation'
import type {IDerivation} from './types'


export class FlatMapDerivation extends AbstractDerivation implements IDerivation<$FixMe> {
  _updateNeededFromIndex: number
  _stackOfDependencies: Array<IDerivation<$IntentionalAny>>
  _fn: $FixMe
  _depDerivation: $FixMe

  constructor(depDerivation: IDerivation<$FixMe>, fn: $FixMe): IDerivation<$FixMe> {
    super()
    this._stackOfDependencies = [depDerivation]
    this._fn = fn
    this._depDerivation = depDerivation
    this._addDependency(depDerivation)
    this._updateNeededFromIndex = 0
    this._maxDepth = 1

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
      const innerValue = i === 1 ? topDerivation.getValue() : this._fn(topDerivation.getValue())
      if (currentDepth === this._maxDepth) {
        return innerValue
      }

      if (innerValue instanceof AbstractDerivation) {
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
      AbstractDerivation.prototype._youMayNeedToUpdateYourself.call(this, msgComingFrom)
    } else if (this._updateNeededFromIndex <= indexOfDep) {
      return
    } else {
      this._updateNeededFromIndex = indexOfDep
      AbstractDerivation.prototype._youMayNeedToUpdateYourself.call(this, msgComingFrom)
    }
  }

  _keepUptodate() {
    this.getValue()
  }
}

export default function flatMap(de: $FixMe, fn: $FixMe) {
  return new FlatMapDerivation(de, fn)
}