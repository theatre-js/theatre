import reducto from '$shared/utils/redux/reducto'
import {$UIAhistoricState} from '$tl/UI/store/types'

const r = reducto($UIAhistoricState)

export const triggerSetPosition = r(
  (s, p: {top: number, left: number}) => {
    s.theTrigger.position = p
  },
)