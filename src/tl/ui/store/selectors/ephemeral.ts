import pointerFriendlySelector from '$shared/utils/redux/pointerFriendlySelector'
import {UIEphemeralState} from '../types/ephemeral'
export const getTrue = pointerFriendlySelector((s: UIEphemeralState) => {
  return true
})

