import type {Prism} from './prism/Interface'
import {isPrism} from './prism/Interface'
import type {PointerType} from './pointer'
import {isPointer} from './pointer'
import type {$IntentionalAny} from './types'
import {pointerToPrism} from './pointerToPrism'

/**
 * Convenience function that returns a plain value from its argument, whether it
 * is a pointer, a prism or a plain value itself.
 *
 * @remarks
 * For pointers, the value is returned by first creating a prism, so it is
 * reactive e.g. when used in a `prism`.
 *
 * @param input - The argument to return a value from.
 */

export const val = <
  P extends
    | PointerType<$IntentionalAny>
    | Prism<$IntentionalAny>
    | undefined
    | null,
>(
  input: P,
): P extends PointerType<infer T>
  ? T
  : P extends Prism<infer T>
  ? T
  : P extends undefined | null
  ? P
  : unknown => {
  if (isPointer(input)) {
    return pointerToPrism(input).getValue() as $IntentionalAny
  } else if (isPrism(input)) {
    return input.getValue() as $IntentionalAny
  } else {
    return input as $IntentionalAny
  }
}
