import type {$IntentionalAny} from '@theatre/shared/utils/types'
import type {Pointer} from '@theatre/dataverse'

type PointerFriendlySelector<S, R, Args extends $IntentionalAny[]> = <
  GivenState extends S | Pointer<S>,
>(
  state: GivenState,
  ...args: Args
) => GivenState extends Pointer<S>
  ? Pointer<R>
  : GivenState extends S
  ? R
  : never

/**
 * Takes a selector and returns a new selector that supports
 * both normal values and pointers
 */
const pointerFriendlySelector = <S, R, Args extends $IntentionalAny[]>(
  fn: (s: S, ...args: Args) => R,
): PointerFriendlySelector<S, R, Args> => {
  return fn as $IntentionalAny as PointerFriendlySelector<S, R, Args>
}

export default pointerFriendlySelector
