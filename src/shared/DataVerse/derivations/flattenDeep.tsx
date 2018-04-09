import AbstractDerivation from './AbstractDerivation'

export class FlattenDeepDerivation extends AbstractDerivation<$FixMe> {
  _stackOfDependencies: Array<AbstractDerivation<$IntentionalAny>>
  _updateNeededFromIndex: number
  _maxDepth: number

  constructor(
    depDerivation: AbstractDerivation<$FixMe>,
    maxDepth: number = 200,
  ) {
    super()
    this._stackOfDependencies = [depDerivation]
    this._maxDepth = maxDepth
    this._updateNeededFromIndex = 0

    this._addDependency(depDerivation)
    return this
  }

  _recalculate() {
    const updateFromIndex =
      this._updateNeededFromIndex === -1 ? 0 : this._updateNeededFromIndex
    this._updateNeededFromIndex = -1

    for (
      let i = this._stackOfDependencies.length - 1;
      i > updateFromIndex;
      i--
    ) {
      const d: AbstractDerivation<
        mixed
      > = this._stackOfDependencies.pop() as any
      this._removeDependency(d)
    }

    let i = updateFromIndex
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const currentDepth = i
      const topDerivation = this._stackOfDependencies[i]
      const innerValue = topDerivation.getValue()
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

  _youMayNeedToUpdateYourself(
    msgComingFrom: AbstractDerivation<$IntentionalAny>,
  ) {
    const indexOfDep = this._stackOfDependencies.indexOf(
      msgComingFrom as $FixMe,
    )

    if (indexOfDep === -1) {
      throw Error(
        `got a _youMayNeedToUpdateYourself() from a dep that's not in the stack`,
      )
    }

    if (this._updateNeededFromIndex === -1) {
      this._updateNeededFromIndex = indexOfDep
      AbstractDerivation.prototype._youMayNeedToUpdateYourself.call(
        this,
        msgComingFrom,
      )
    } else if (this._updateNeededFromIndex <= indexOfDep) {
      return
    } else {
      this._updateNeededFromIndex = indexOfDep
      AbstractDerivation.prototype._youMayNeedToUpdateYourself.call(
        this,
        msgComingFrom,
      )
    }
  }

  _keepUptodate() {
    this.getValue()
  }
}

function flattenDeep<V>(
  depDerivation: AbstractDerivation<V>,
  maxDepth: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 = 7,
) {
  return new FlattenDeepDerivation(depDerivation, maxDepth)
}

export default flattenDeep
