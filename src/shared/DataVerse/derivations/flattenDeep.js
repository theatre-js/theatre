// @flow
import AbstractDerivation from './AbstractDerivation'
import type {IDerivation} from './types'

export class FlattenDeepDerivation extends AbstractDerivation
  implements IDerivation<$FixMe> {
  _stackOfDependencies: Array<IDerivation<$IntentionalAny>>
  _updateNeededFromIndex: number
  _maxDepth: number

  constructor(
    depDerivation: IDerivation<$FixMe>,
    maxDepth: number = 200,
  ): IDerivation<$FixMe> {
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

    for (let i = this._stackOfDependencies.length - 1; i > updateFromIndex; i--) {
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

  _youMayNeedToUpdateYourself(msgComingFrom: IDerivation<$IntentionalAny>) {
    const indexOfDep = this._stackOfDependencies.indexOf((msgComingFrom: $FixMe))

    if (indexOfDep === -1) {
      throw Error(
        `got a _youMayNeedToUpdateYourself() from a dep that's not in the stack`,
      )
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

export type FlattenDeepFn = (<Ret, V1: IDerivation<Ret>, D: 0>(
  outer: V1,
  D,
) => IDerivation<Ret>) &
  (<Ret, V2: IDerivation<Ret>, V1: IDerivation<V2>, D: 1>(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V1: IDerivation<Ret>, D: 1>(outer: V1, D) => IDerivation<Ret>) &
  (<Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2>, D: 2>(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V2: IDerivation<Ret>, V1: IDerivation<V2>, D: 2>(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V1: IDerivation<Ret>, D: 2>(outer: V1, D) => IDerivation<Ret>) &
  (<
    Ret,
    V4: IDerivation<Ret>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 3,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2>, D: 3>(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V2: IDerivation<Ret>, V1: IDerivation<V2>, D: 3>(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V1: IDerivation<Ret>, D: 3>(outer: V1, D) => IDerivation<Ret>) &
  (<
    Ret,
    V5: IDerivation<Ret>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 4,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V4: IDerivation<Ret>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 4,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2>, D: 4>(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V2: IDerivation<Ret>, V1: IDerivation<V2>, D: 4>(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V1: IDerivation<Ret>, D: 4>(outer: V1, D) => IDerivation<Ret>) &
  (<
    Ret,
    V6: IDerivation<Ret>,
    V5: IDerivation<V6>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 5,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V5: IDerivation<Ret>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 5,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V4: IDerivation<Ret>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 5,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2>, D: 5>(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V2: IDerivation<Ret>, V1: IDerivation<V2>, D: 5>(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V1: IDerivation<Ret>, D: 5>(outer: V1, D) => IDerivation<Ret>) &
  (<
    Ret,
    V7: IDerivation<Ret>,
    V6: IDerivation<V7>,
    V5: IDerivation<V6>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 6,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V6: IDerivation<Ret>,
    V5: IDerivation<V6>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 6,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V5: IDerivation<Ret>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 6,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V4: IDerivation<Ret>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 6,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2>, D: 6>(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V2: IDerivation<Ret>, V1: IDerivation<V2>, D: 6>(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V1: IDerivation<Ret>, D: 6>(outer: V1, D) => IDerivation<Ret>) &
  (<
    Ret,
    V8: IDerivation<Ret>,
    V7: IDerivation<V8>,
    V6: IDerivation<V7>,
    V5: IDerivation<V6>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 7,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V7: IDerivation<Ret>,
    V6: IDerivation<V7>,
    V5: IDerivation<V6>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 7,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V6: IDerivation<Ret>,
    V5: IDerivation<V6>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 7,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V5: IDerivation<Ret>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 7,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V4: IDerivation<Ret>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
    D: 7,
  >(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2>, D: 7>(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V2: IDerivation<Ret>, V1: IDerivation<V2>, D: 7>(
    outer: V1,
    D,
  ) => IDerivation<Ret>) &
  (<Ret, V1: IDerivation<Ret>, D: 7>(outer: V1, D) => IDerivation<Ret>) &
  (<
    Ret,
    V8: IDerivation<Ret>,
    V7: IDerivation<V8>,
    V6: IDerivation<V7>,
    V5: IDerivation<V6>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
  >(
    outer: V1,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V7: IDerivation<Ret>,
    V6: IDerivation<V7>,
    V5: IDerivation<V6>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
  >(
    outer: V1,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V6: IDerivation<Ret>,
    V5: IDerivation<V6>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
  >(
    outer: V1,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V5: IDerivation<Ret>,
    V4: IDerivation<V5>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
  >(
    outer: V1,
  ) => IDerivation<Ret>) &
  (<
    Ret,
    V4: IDerivation<Ret>,
    V3: IDerivation<V4>,
    V2: IDerivation<V3>,
    V1: IDerivation<V2>,
  >(
    outer: V1,
  ) => IDerivation<Ret>) &
  (<Ret, V3: IDerivation<Ret>, V2: IDerivation<V3>, V1: IDerivation<V2>>(
    outer: V1,
  ) => IDerivation<Ret>) &
  (<Ret, V2: IDerivation<Ret>, V1: IDerivation<V2>>(outer: V1) => IDerivation<Ret>) &
  (<Ret, V1: IDerivation<Ret>>(outer: V1) => IDerivation<Ret>)

function flattenDeep<V>(
  depDerivation: IDerivation<V>,
  maxDepth: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 = 7,
): IDerivation<$FixMe> {
  return new FlattenDeepDerivation(depDerivation, maxDepth)
}

export default ((flattenDeep: $IntentionalAny): FlattenDeepFn)
