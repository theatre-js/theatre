import {Pointer} from '$shared/DataVerse2/pointer'

type PointerFriendly<S, R, Args extends $IntentionalAny[]> = ((
  s: Pointer<S>,
  ...args: Args
) => Pointer<R>) &
  ((s: S, ...args: Args) => R)

/**
 * Takes a selector and returns a new selector that supports
 * both normal values and pointers
 */
const pointerFriendlySelector = <S, R, Args extends $IntentionalAny[]>(
  fn: (s: S, ...args: Args) => R,
): PointerFriendly<S, R, Args> => {
  return fn as $IntentionalAny
}

export default pointerFriendlySelector