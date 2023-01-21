import type {Prism} from './prism/Interface'
import type {Pointer, PointerType} from './pointer'
import {getPointerMeta} from './pointer'
import type {$IntentionalAny} from './types'

const identifyPrismWeakMap = new WeakMap<{}, Prism<unknown>>()

/**
 * Interface for objects that can provide a prism at a certain path.
 */
export interface PointerToPrismProvider {
  /**
   * @internal
   * Future: We could consider using a `Symbol.for("dataverse/PointerToPrismProvider")` as a key here, similar to
   * how {@link Iterable} works for `of`.
   */
  readonly $$isPointerToPrismProvider: true
  /**
   * Returns a prism of the value at the provided pointer.
   */
  pointerToPrism<P>(pointer: Pointer<P>): Prism<P>
}

export function isPointerToPrismProvider(
  val: unknown,
): val is PointerToPrismProvider {
  return (
    typeof val === 'object' &&
    val !== null &&
    (val as $IntentionalAny)['$$isPointerToPrismProvider'] === true
  )
}

/**
 * Returns a prism of the value at the provided pointer. Prisms are
 * cached per pointer.
 *
 * @param pointer - The pointer to return the prism at.
 */

export const pointerToPrism = <P extends PointerType<$IntentionalAny>>(
  pointer: P,
): Prism<P extends PointerType<infer T> ? T : void> => {
  const meta = getPointerMeta(pointer)

  let prismInstance = identifyPrismWeakMap.get(meta)
  if (!prismInstance) {
    const root = meta.root
    if (!isPointerToPrismProvider(root)) {
      throw new Error(
        `Cannot run pointerToPrism() on a pointer whose root is not an PointerToPrismProvider`,
      )
    }
    prismInstance = root.pointerToPrism(pointer as $IntentionalAny)
    identifyPrismWeakMap.set(meta, prismInstance)
  }
  return prismInstance as $IntentionalAny
}
