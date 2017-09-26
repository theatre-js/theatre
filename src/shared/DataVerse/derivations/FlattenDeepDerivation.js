// @flow
import Derivation from './Derivation'

export default class FlattenDeepDerivation extends Derivation<$FixMe> {
  _stack: Array<Derivation<mixed>>
  _updateNeededFromIndex: number
  _maxDepth: number

  constructor(depDerivation: Derivation<$FixMe>, maxDepth: number = 200) {
    super()
    this._stack = [depDerivation]
    this._maxDepth = maxDepth
    this._updateNeededFromIndex = 0

    depDerivation._addDependent(this)
  }

  _recalculate() {
    const updateFromIndex = this._updateNeededFromIndex
    this._updateNeededFromIndex = -1

    if (updateFromIndex === -1) {
      console.warn(`_recalculate() called when _updateNeededFromIndex is -1. This shouldn't happen`)
      return
    }

    for (let i = this._stack.length - 1; i > updateFromIndex; i--) {
      this._stack.pop()._removeDependent(this)
    }

    let i = updateFromIndex
    while(true) {
      const currentDepth = i
      const topDerivation = this._stack[i]
      const innerValue = topDerivation.getValue()
      if (currentDepth === this._maxDepth) {
        return innerValue
      }

      if (innerValue instanceof Derivation) {
        this._stack.push(innerValue)
        innerValue._addDependent(this)
      } else {
        return innerValue
      }
      i++
    }
  }

  _youMayNeedToUpdateYourself(msgComingFrom: mixed) {
    const indexOfDep = this._stack.indexOf((msgComingFrom: $FixMe))

    if (indexOfDep === -1) {
      throw Error(`got a _youMayNeedToUpdateYourself() from a dep that's not in the stack`)
    }

    if (this._updateNeededFromIndex === -1) {
      this._updateNeededFromIndex = indexOfDep
      Derivation.prototype._youMayNeedToUpdateYourself.call(this)
    } else if (this._updateNeededFromIndex <= indexOfDep) {
      return
    } else {
      this._updateNeededFromIndex = indexOfDep
      Derivation.prototype._youMayNeedToUpdateYourself.call(this)
    }
  }

  _onWhetherPeopleCareAboutMeStateChange(peopleCare: boolean) {
    if (peopleCare) {
      this.getValue()
    }
  }
}