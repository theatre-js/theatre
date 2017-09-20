// @flow
import Derivation from './Derivation'

export default class FlattenDerivation extends Derivation {
  _outerDep: Derivation
  _innerDep: ?Derivation
  _updateNeededFromOuterDep: *
  _updateNeededFromInnerDep: *

  constructor(depDerivation: Derivation) {
    super()
    this._outerDep = depDerivation
    this._innerDep = null
    this._updateNeededFromOuterDep = true
    this._updateNeededFromInnerDep = false

    depDerivation._addDependent(this)
  }

  _recalculate() {
    if (this._updateNeededFromOuterDep) {
      const innerDep = this._outerDep.getValue()
      this._updateNeededFromOuterDep = false
      this._updateNeededFromInnerDep = false
      if (innerDep !== this._innerDep) {
        if (this._innerDep) {
          this._innerDep._removeDependent(this)
        }
      } else {
        return innerDep.getValue()
      }

      this._innerDep = innerDep
      innerDep._addDependent(this)
      return innerDep.getValue()
    } else if (this._updateNeededFromInnerDep) {
      if (!this._innerDep) {
        throw Error(`_updateNeededFromInnerDep is true, but innerDep doesn't exist`)
      }

      this._updateNeededFromInnerDep = false
      return this._innerDep.getValue()
    }
  }

  _youMayNeedToUpdateYourself(msgComingFrom: mixed) {
    if (msgComingFrom === this._outerDep) {
      this._updateNeededFromOuterDep = true
    } else if (msgComingFrom === this._innerDep) {
      this._updateNeededFromInnerDep = true
    } else {
      throw Error(`This should never happen`)
    }

    Derivation.prototype._youMayNeedToUpdateYourself.call(this)
  }

  // _onWhetherPeopleCareAboutMeStateChange(peopleCare: boolean) {
  //   if (peopleCare) {

  //   }
  // }
}