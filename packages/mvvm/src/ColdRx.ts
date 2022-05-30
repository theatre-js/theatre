import type {RxForView} from './best-practices'
import {Rx} from './best-practices'
import type {DisposableLike, TeardownLogic} from './Disposable'
import {Disposable, execFinalizer} from './Disposable'
import type {Tapper} from './types'
import {arrRemove} from './utils/arrRemove'

const cold = Symbol('cold')
const hot = Symbol('hot')
type Cold = typeof cold
type Hot = typeof hot
type IsHot<T> = [Extract<T, Hot>] extends [never] ? false : true
type A1 = IsHot<Cold>
type A2 = IsHot<Hot>

/** Multicast by default observables */
export class ColdRx<T> extends Rx<T> implements RxForView<T> {
  constructor(source: (observer: Tapper<T>) => TeardownLogic) {
    super()
    if (source) {
      this.source = new Rx(source)
    }
  }
  #observers: Tapper<T> | Tapper<T>[] | null = null
  #sourceTeardown: TeardownLogic = undefined

  // @ts-ignore
  forView: RxForView<T>['forView']
  // @ts-ignore
  forView() {
    return this
  }

  private _sourceEmit(value: T) {
    if (!this.#observers) return
    if (Array.isArray(this.#observers)) {
      for (const obs of this.#observers) {
        obs(value)
      }
    } else {
      this.#observers(value)
    }
  }

  private _dispose(observer: Tapper<T>) {
    const disposeSource = Array.isArray(this.#observers)
      ? (arrRemove(this.#observers, observer), this.#observers.length === 0)
      : this.#observers === observer
    if (disposeSource) {
      this.#observers = null
      execFinalizer(this.#sourceTeardown)
      this.#sourceTeardown = undefined
    }
  }

  /** Returns a disposable for removing this tap in particular */
  override tap(disposable: Disposable, observer: Tapper<T>): DisposableLike {
    const os = this.#observers
    this.#observers = Array.isArray(os)
      ? (os.push(observer), os)
      : os
      ? [os, observer]
      : // os must have been null
        ((this.#sourceTeardown = this.source(this._sourceEmit.bind(this))),
        observer)
    const like: DisposableLike = new Disposable(
      this._dispose.bind(this, observer),
    )
    disposable.add(like)
    return like
  }
}
