import type {Prism} from './derivations/Interface'
import prism from './derivations/prism/prism'
import Emitter from './utils/Emitter'

/**
 * Common interface for Box types. Boxes wrap a single value.
 */
export interface IBox<V> {
  /**
   * Sets the value of the Box.
   *
   * @param v - The value to update the Box with.
   */

  set(v: V): void
  /**
   * Gets the value of the Box.
   *
   * @remarks
   * Usages of `get()` aren't tracked, they are only for retrieving the value. To track changes, you need to
   * create a derivation.
   *
   * @see derivation
   */
  get(): V

  /**
   * Creates a derivation of the Box that you can use to track changes to it.
   */
  derivation: Prism<V>
}

/**
 * Wraps a single value.
 *
 * @remarks
 * Derivations created with {@link Box.derivation} update based on strict equality (`===`) of the old value and the new one.
 * This also means that property-changes of objects won't be tracked, and that for objects, updates will trigger on changes of
 * reference even if the objects are structurally equal.
 */
export default class Box<V> implements IBox<V> {
  private _publicDerivation: Prism<V>
  private _emitter = new Emitter<V>()

  /**
   * @param _value - The initial value of the Box.
   */
  constructor(
    /**
     * @internal
     */
    protected _value: V,
  ) {
    const subscribe = (listener: (val: V) => void) =>
      this._emitter.tappable.tap(listener)
    const getValue = () => this._value
    this._publicDerivation = prism(() => {
      return prism.source(subscribe, getValue)
    })
  }

  /**
   * Sets the value of the Box.
   *
   * @param v - The value to update the Box with.
   */
  set(v: V) {
    if (v === this._value) return
    this._value = v
    this._emitter.emit(v)
  }

  /**
   * Gets the value of the Box.
   *
   * Note: usages of `get()` aren't tracked, they are only for retrieving the value. To track changes, you need to
   * create a derivation.
   *
   * @see Box.derivation
   */
  get() {
    return this._value
  }

  /**
   * Creates a derivation of the Box that you can use to track changes to it.
   */
  get derivation() {
    return this._publicDerivation
  }
}
