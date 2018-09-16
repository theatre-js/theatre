import pointerFriendlySelector from '$shared/utils/redux/pointerFriendlySelector'
import {UIAhistoricState} from '../types'
export const getTrue = pointerFriendlySelector((s: UIAhistoricState) => {
  return true
})

