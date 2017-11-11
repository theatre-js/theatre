// @flow
import AbstractDerivation from './AbstractDerivation'
import type {IDerivation} from './types'

const UPDATE_NEEDED_FROM = {
  none: 0,
  dep: 1,
  inner: 2,
}

export class FlatMapDerivation extends AbstractDerivation
  implements IDerivation<$FixMe> {
  _updateNeededFromIndex: number
  _stackOfDependencies: Array<IDerivation<$IntentionalAny>>
  _fn: $FixMe
  _depDerivation: $FixMe
  _innerDerivation: ?IDerivation<$IntentionalAny>
  _updateNeededFrom: $Values<typeof UPDATE_NEEDED_FROM>

  constructor(
    depDerivation: IDerivation<$FixMe>,
    fn: $FixMe,
  ): IDerivation<$FixMe> {
    super()
    this._fn = fn
    this._depDerivation = depDerivation
    this._innerDerivation = undefined
    this._updateNeededFrom = UPDATE_NEEDED_FROM.dep
    this._hot = false

    this._addDependency(depDerivation)

    return this
  }

  _recalculateHot() {
    const updateNeededFrom = this._updateNeededFrom
    this._updateNeededFrom = UPDATE_NEEDED_FROM.none

    if (updateNeededFrom === UPDATE_NEEDED_FROM.inner) {
      // $FlowIgnore
      return this._innerDerivation.getValue()
    }

    const possibleInnerDerivation = this._fn(this._depDerivation.getValue())

    if (possibleInnerDerivation instanceof AbstractDerivation) {
      this._innerDerivation = possibleInnerDerivation
      this._addDependency(possibleInnerDerivation)
      return possibleInnerDerivation.getValue()
    } else {
      return possibleInnerDerivation
    }
  }

  _recalculateCold() {
    const possibleInnerDerivation = this._fn(this._depDerivation.getValue())

    if (possibleInnerDerivation instanceof AbstractDerivation) {
      return possibleInnerDerivation.getValue()
    } else {
      return possibleInnerDerivation
    }
  }

  _recalculate() {
    return this._hot ? this._recalculateHot() : this._recalculateCold()
  }

  _youMayNeedToUpdateYourself(msgComingFrom: IDerivation<$IntentionalAny>) {
    const updateNeededFrom =
      msgComingFrom === this._depDerivation
        ? UPDATE_NEEDED_FROM.dep
        : UPDATE_NEEDED_FROM.inner

    if (
      updateNeededFrom === UPDATE_NEEDED_FROM.inner &&
      msgComingFrom !== this._innerDerivation
    ) {
      throw Error(
        `got a _youMayNeedToUpdateYourself() from neither the dep nor the inner derivation`,
      )
    }

    if (this._updateNeededFrom === UPDATE_NEEDED_FROM.none) {
      this._updateNeededFrom = updateNeededFrom

      if (updateNeededFrom === UPDATE_NEEDED_FROM.dep) {
        this._removeInnerDerivation()
      }

      AbstractDerivation.prototype._youMayNeedToUpdateYourself.call(
        this,
        msgComingFrom,
      )
    } else if (this._updateNeededFrom === UPDATE_NEEDED_FROM.dep) {
      return
    } else {
      if (updateNeededFrom === UPDATE_NEEDED_FROM.dep) {
        this._updateNeededFrom = UPDATE_NEEDED_FROM.dep
        this._removeInnerDerivation()
      }
    }
  }

  _removeInnerDerivation() {
    if (this._innerDerivation) {
      this._removeDependency(this._innerDerivation)
      this._innerDerivation = undefined
    }
  }

  _keepUptodate() {
    this._hot = true
    this._updateNeededFrom = UPDATE_NEEDED_FROM.dep
    this.getValue()
  }

  _stopKeepingUptodate() {
    this._hot = false
    this._updateNeededFrom = UPDATE_NEEDED_FROM.dep
    this._removeInnerDerivation()
  }
}

export default function flatMap(de: $FixMe, fn: $FixMe) {
  return new FlatMapDerivation(de, fn)
}
