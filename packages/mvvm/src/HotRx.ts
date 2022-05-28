import type {RxForView} from './best-practices'
import {Rx} from './best-practices'
import {ColdRx} from './ColdRx'
import type {Disposable} from './Disposable'
import type {Tapper} from './types'

export class HotRx<T> extends Rx<T> implements RxForView<T> {
  #update: Tapper<T> | undefined
  // kept for emitting out
  #emitter: ColdRx<T> | undefined
  #value: T
  constructor(value: T) {
    super()
    this.#value = value
  }

  override tap(disposable: Disposable, tapper: Tapper<T>): void {
    let cold = this.#emitter
    if (cold == null) {
      this.#emitter = cold = new ColdRx(
        (observer) => (
          observer(this.#value),
          // ColdValue must be able to guarantee that teardown is not performed
          // multiple times.
          (this.#update = observer),
          () => (this.#update = undefined)
        ),
      )
    }
    tapper(this.#value)
    cold.tap(disposable, tapper)
  }

  // @ts-ignore
  forView: RxForView<T>['forView']
  // @ts-ignore
  forView() {
    return this
  }

  get(): T {
    return this.#value
  }

  set(value: T) {
    this.#value = value
    this.#update?.(value)
  }

  update(fn: (current: T) => T) {
    this.set(fn(this.#value))
  }
}
