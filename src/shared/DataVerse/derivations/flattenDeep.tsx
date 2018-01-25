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
    // depDerivation._addDependent(this)
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
      const d = this._stackOfDependencies.pop()
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

// export type FlattenDeepFn = (<Ret, V1: AbstractDerivation<Ret>, D: 0>(
//   outer: V1,
//   D,
// ) => AbstractDerivation<Ret>) &
//   (<Ret, V2: AbstractDerivation<Ret>, V1: AbstractDerivation<V2>, D: 1>(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V1: AbstractDerivation<Ret>, D: 1>(outer: V1, D) => AbstractDerivation<Ret>) &
//   (<Ret, V3: AbstractDerivation<Ret>, V2: AbstractDerivation<V3>, V1: AbstractDerivation<V2>, D: 2>(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V2: AbstractDerivation<Ret>, V1: AbstractDerivation<V2>, D: 2>(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V1: AbstractDerivation<Ret>, D: 2>(outer: V1, D) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V4: AbstractDerivation<Ret>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 3,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V3: AbstractDerivation<Ret>, V2: AbstractDerivation<V3>, V1: AbstractDerivation<V2>, D: 3>(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V2: AbstractDerivation<Ret>, V1: AbstractDerivation<V2>, D: 3>(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V1: AbstractDerivation<Ret>, D: 3>(outer: V1, D) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V5: AbstractDerivation<Ret>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 4,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V4: AbstractDerivation<Ret>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 4,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V3: AbstractDerivation<Ret>, V2: AbstractDerivation<V3>, V1: AbstractDerivation<V2>, D: 4>(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V2: AbstractDerivation<Ret>, V1: AbstractDerivation<V2>, D: 4>(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V1: AbstractDerivation<Ret>, D: 4>(outer: V1, D) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V6: AbstractDerivation<Ret>,
//     V5: AbstractDerivation<V6>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 5,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V5: AbstractDerivation<Ret>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 5,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V4: AbstractDerivation<Ret>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 5,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V3: AbstractDerivation<Ret>, V2: AbstractDerivation<V3>, V1: AbstractDerivation<V2>, D: 5>(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V2: AbstractDerivation<Ret>, V1: AbstractDerivation<V2>, D: 5>(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V1: AbstractDerivation<Ret>, D: 5>(outer: V1, D) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V7: AbstractDerivation<Ret>,
//     V6: AbstractDerivation<V7>,
//     V5: AbstractDerivation<V6>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 6,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V6: AbstractDerivation<Ret>,
//     V5: AbstractDerivation<V6>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 6,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V5: AbstractDerivation<Ret>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 6,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V4: AbstractDerivation<Ret>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 6,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V3: AbstractDerivation<Ret>, V2: AbstractDerivation<V3>, V1: AbstractDerivation<V2>, D: 6>(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V2: AbstractDerivation<Ret>, V1: AbstractDerivation<V2>, D: 6>(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V1: AbstractDerivation<Ret>, D: 6>(outer: V1, D) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V8: AbstractDerivation<Ret>,
//     V7: AbstractDerivation<V8>,
//     V6: AbstractDerivation<V7>,
//     V5: AbstractDerivation<V6>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 7,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V7: AbstractDerivation<Ret>,
//     V6: AbstractDerivation<V7>,
//     V5: AbstractDerivation<V6>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 7,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V6: AbstractDerivation<Ret>,
//     V5: AbstractDerivation<V6>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 7,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V5: AbstractDerivation<Ret>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 7,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V4: AbstractDerivation<Ret>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//     D: 7,
//   >(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V3: AbstractDerivation<Ret>, V2: AbstractDerivation<V3>, V1: AbstractDerivation<V2>, D: 7>(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V2: AbstractDerivation<Ret>, V1: AbstractDerivation<V2>, D: 7>(
//     outer: V1,
//     D,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V1: AbstractDerivation<Ret>, D: 7>(outer: V1, D) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V8: AbstractDerivation<Ret>,
//     V7: AbstractDerivation<V8>,
//     V6: AbstractDerivation<V7>,
//     V5: AbstractDerivation<V6>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//   >(
//     outer: V1,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V7: AbstractDerivation<Ret>,
//     V6: AbstractDerivation<V7>,
//     V5: AbstractDerivation<V6>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//   >(
//     outer: V1,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V6: AbstractDerivation<Ret>,
//     V5: AbstractDerivation<V6>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//   >(
//     outer: V1,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V5: AbstractDerivation<Ret>,
//     V4: AbstractDerivation<V5>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//   >(
//     outer: V1,
//   ) => AbstractDerivation<Ret>) &
//   (<
//     Ret,
//     V4: AbstractDerivation<Ret>,
//     V3: AbstractDerivation<V4>,
//     V2: AbstractDerivation<V3>,
//     V1: AbstractDerivation<V2>,
//   >(
//     outer: V1,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V3: AbstractDerivation<Ret>, V2: AbstractDerivation<V3>, V1: AbstractDerivation<V2>>(
//     outer: V1,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V2: AbstractDerivation<Ret>, V1: AbstractDerivation<V2>>(
//     outer: V1,
//   ) => AbstractDerivation<Ret>) &
//   (<Ret, V1: AbstractDerivation<Ret>>(outer: V1) => AbstractDerivation<Ret>)

function flattenDeep<V>(
  depDerivation: AbstractDerivation<V>,
  maxDepth: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 = 7,
) {
  return new FlattenDeepDerivation(depDerivation, maxDepth)
}

export default flattenDeep
