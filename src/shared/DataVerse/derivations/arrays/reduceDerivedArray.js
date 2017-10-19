// @flow
import AbstractDerivation from '../AbstractDerivation'
import type {IDerivation} from '../types'
import type {IDerivedArray} from './types'
import constant from '../constant'
import of from '../of'
// import proxy from '../proxy'

const noop = () => {}
// const none = constant(undefined)

export class DerivedArrayReduction<T, V> extends AbstractDerivation implements IDerivation<V> {
  getValue: () => V
  _derivedArray: IArrayAtom<V>
  _fn: $FixMe
  _untapFromDerivedArrayChanges: Function
  _updateNeededFromIndex: number // `-1` means update comes from the top flatMap derivation. 0,1,2,... mean update is required because the derivedArray has had a change
  _seed: $FixMe

  constructor(derivedArray: IDerivedArray<T>, fn: $FixMe, seed: $FixMe): IDerivation<V> {
    super()
    this._derivedArray = derivedArray
    this._fn = fn
    this._seed = of(seed)
    this._untapFromDerivedArrayChanges = noop
    this._updateNeededFromIndex = 0
    this._stack = []
    return this
  }

  _recalculate(): $FixMe {
    if (this._updateNeededFromIndex === -1) {
      return this._stack[this._stack.length - 1].getValue()
    }

    const updateFromIndex = this._updateNeededFromIndex
    this._updateNeededFromIndex = -1

    if (this._stack.length > 0) {
      this._removeDependency(this._stack[this._stack.length - 1])
    }

    for (let i = this._stack.length - 1; i >= updateFromIndex; i--) {
      this._stack.pop()
    }

    for (let i = updateFromIndex; i < this._derivedArray.length(); i++) {
      const prevDerivation = i === 0 ? this._seed : this._stack[i - 1]
      const curDerivation = prevDerivation.flatMap((acc) => {
        return this._derivedArray.index(i).flatMap((t) => {
          return this._fn(acc, t, i)
        })
      })
      this._stack.push(curDerivation)
    }

    const topDerivation = this._stack[this._stack.length - 1]

    this._addDependency(topDerivation)
    return topDerivation.getValue()
  }

  _keepUptodate() {
    this._untapFromDerivedArrayChanges = this._derivedArray.changes().tap((c) => {
      if (this._updateNeededFromIndex === -1) {
        this._updateNeededFromIndex = c.startIndex
      } else {
        this._updateNeededFromIndex = Math.min(this._updateNeededFromIndex, c.startIndex)
      }
      this._youMayNeedToUpdateYourself(this)
    })
    this.getValue()
  }

  _stopKeepingUptodate() {
    this._untapFromDerivedArrayChanges()
    this._untapFromDerivedArrayChanges = noop
  }
}

export default function reduceDerivedArray<T, V, Acc: V, Seed: Acc, A: IDerivedArray<T>, Fn: (Acc, T, number) => Acc>(a: A, fn: Fn, seed: Seed): IDerivation<V> {
  return new DerivedArrayReduction(a, fn, seed)
}