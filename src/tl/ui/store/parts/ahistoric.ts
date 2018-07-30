import reducto from '$shared/utils/redux/reducto'
import {$UIAhistoricState, UIAhistoricState} from '$tl/ui/store/types'

const r = reducto($UIAhistoricState)

export const setUIVisibilityState = r(
  (s, p: UIAhistoricState['visibilityState']) => {
    s.visibilityState = p
  },
)
