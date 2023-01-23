import type Ticker from '../Ticker'
import type {$IntentionalAny, VoidFn} from '../types'

type IDependent = (msgComingFrom: Prism<$IntentionalAny>) => void

/**
 * Common interface for prisms.
 */
export interface Prism<V> {
  /**
   * Whether the object is a prism.
   */
  isPrism: true

  /**
   * Whether the prism is hot.
   */
  isHot: boolean

  /**
   * Calls `listener` with a fresh value every time the prism _has_ a new value, throttled by Ticker.
   */
  onChange(
    ticker: Ticker,
    listener: (v: V) => void,
    immediate?: boolean,
  ): VoidFn

  onStale(cb: () => void): VoidFn

  /**
   * Keep the prism hot, even if there are no tappers (subscribers).
   */
  keepHot(): VoidFn

  /**
   * Add a prism as a dependent of this prism.
   *
   * @param d - The prism to be made a dependent of this prism.
   *
   * @see _removeDependent
   *
   * @internal
   */
  _addDependent(d: IDependent): void

  /**
   * Remove a prism as a dependent of this prism.
   *
   * @param d - The prism to be removed from as a dependent of this prism.
   *
   * @see _addDependent
   * @internal
   */
  _removeDependent(d: IDependent): void

  /**
   * Gets the current value of the prism. If the value is stale, it causes the prism to freshen.
   */
  getValue(): V
}

/**
 * Returns whether `d` is a prism.
 */
export function isPrism(d: any): d is Prism<unknown> {
  return !!(d && d.isPrism && d.isPrism === true)
}
