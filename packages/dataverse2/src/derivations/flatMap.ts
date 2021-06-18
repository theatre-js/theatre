import type {$FixMe} from '../types'
import AbstractDerivation from './AbstractDerivation'
import type {IDerivation} from './IDerivation'

enum UPDATE_NEEDED_FROM {
  none = 0,
  dep = 1,
  inner = 2,
}

const makeFlatMapDerivationClass = () => {
  class FlatMapDerivation<V, DepType> extends AbstractDerivation<V> {
    private _innerDerivation: undefined | null | IDerivation<V>
    private _staleDependency: UPDATE_NEEDED_FROM

    static displayName = 'flatMap'

    constructor(
      readonly _depDerivation: IDerivation<DepType>,
      readonly _fn: (v: DepType) => IDerivation<V> | V,
    ) {
      super()
      this._innerDerivation = undefined
      this._staleDependency = UPDATE_NEEDED_FROM.dep

      this._addDependency(_depDerivation)

      return this
    }

    _recalculateHot() {
      const updateNeededFrom = this._staleDependency
      this._staleDependency = UPDATE_NEEDED_FROM.none

      if (updateNeededFrom === UPDATE_NEEDED_FROM.inner) {
        // @ts-ignore
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

    protected _recalculateCold() {
      const possibleInnerDerivation = this._fn(this._depDerivation.getValue())

      if (possibleInnerDerivation instanceof AbstractDerivation) {
        return possibleInnerDerivation.getValue()
      } else {
        return possibleInnerDerivation
      }
    }

    protected _recalculate() {
      return this.isHot ? this._recalculateHot() : this._recalculateCold()
    }

    protected _reactToDependencyBecomingStale(
      msgComingFrom: IDerivation<unknown>,
    ) {
      const updateNeededFrom =
        msgComingFrom === this._depDerivation
          ? UPDATE_NEEDED_FROM.dep
          : UPDATE_NEEDED_FROM.inner

      if (
        updateNeededFrom === UPDATE_NEEDED_FROM.inner &&
        msgComingFrom !== this._innerDerivation
      ) {
        throw Error(
          `got a _pipostale() from neither the dep nor the inner derivation`,
        )
      }

      if (this._staleDependency === UPDATE_NEEDED_FROM.none) {
        this._staleDependency = updateNeededFrom

        if (updateNeededFrom === UPDATE_NEEDED_FROM.dep) {
          this._removeInnerDerivation()
        }
      } else if (this._staleDependency === UPDATE_NEEDED_FROM.dep) {
      } else {
        if (updateNeededFrom === UPDATE_NEEDED_FROM.dep) {
          this._staleDependency = UPDATE_NEEDED_FROM.dep
          this._removeInnerDerivation()
        }
      }
    }

    private _removeInnerDerivation() {
      if (this._innerDerivation) {
        this._removeDependency(this._innerDerivation)
        this._innerDerivation = undefined
      }
    }

    protected _keepHot() {
      this._staleDependency = UPDATE_NEEDED_FROM.dep
      this.getValue()
    }

    protected _becomeCold() {
      this._staleDependency = UPDATE_NEEDED_FROM.dep
      this._removeInnerDerivation()
    }
  }
  return FlatMapDerivation
}

let cls: ReturnType<typeof makeFlatMapDerivationClass> | undefined = undefined

export default function flatMap<V, R>(
  dep: IDerivation<V>,
  fn: (v: V) => R,
): IDerivation<R extends IDerivation<infer T> ? T : R> {
  if (!cls) {
    cls = makeFlatMapDerivationClass()
  }
  return new cls(dep, fn) as $FixMe
}
