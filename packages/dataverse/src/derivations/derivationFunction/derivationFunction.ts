import type {PointerType} from '@theatre/dataverse'
import {toDerivation, val} from '../../Atom'
import type {$IntentionalAny} from '../../types'
import AbstractDerivation from '../AbstractDerivation'
import type {IDerivation} from '../IDerivation'

function some<T>(set: Set<T>, predicate: (item: T) => boolean): boolean {
  for (const item of set) {
    if (predicate(item)) return true
  }
  return false
}

type Val =
  | PointerType<$IntentionalAny>
  | IDerivation<$IntentionalAny>
  | undefined
  | null

type DerivationFunction<V, P extends Val> = () => Iterator<
  P,
  V,
  P extends PointerType<infer T>
    ? T
    : P extends IDerivation<infer T>
    ? T
    : P extends undefined | null
    ? P
    : unknown
>

// ref: https://github.com/tj/co
export class DerivationFunctionDerivation<V> extends AbstractDerivation<V> {
  protected _DependencyValueCache: Map<IDerivation<unknown>, unknown> =
    new Map()
  protected _possiblyStaleDeps = new Set<IDerivation<unknown>>()

  constructor(readonly _fn: DerivationFunction<V, Val>) {
    super()
  }

  _recalculate() {
    const doesStaleDepExist = some(
      this._possiblyStaleDeps,
      (dep) => this._DependencyValueCache.get(dep) !== dep.getValue(),
    )
    this._possiblyStaleDeps.clear() // checked the deps so we know if they are stale or not
    if (!doesStaleDepExist) return this._lastValue!

    const newDeps: Set<IDerivation<unknown>> = new Set()
    this._DependencyValueCache.clear()

    let value: V
    try {
      const iter = this._fn()
      let curr = iter.next()
      while (!curr.done) {
        const dep = toDerivation(curr.value)
        newDeps.add(dep)
        this._addDependency(dep)
        curr = iter.next(val(dep))
      }
      value = curr.value
    } catch (error) {
      console.error(error)
    }

    // remove deps that were removed (why is this necessary?)
    for (const dep of this._dependencies) {
      if (!newDeps.has(dep)) {
        this._removeDependency(dep)
      }
    }
    this._dependencies = newDeps

    for (const dep of newDeps) {
      this._DependencyValueCache.set(dep, dep.getValue())
    }

    return value!
  }

  _reactToDependencyBecomingStale(msgComingFrom: IDerivation<unknown>) {
    this._possiblyStaleDeps.add(msgComingFrom)
  }

  _keepHot() {
    this.getValue()
  }
}

/**
 * Creates a derivation from the passed function that adds all derivations referenced
 * in it as dependencies, and reruns the function when these change.
 *
 * @param fn - The function to rerun when the derivations referenced in it change.
 */
const derive = <V>(fn: DerivationFunction<V, Val>) =>
  new DerivationFunctionDerivation(fn)

export default derive
