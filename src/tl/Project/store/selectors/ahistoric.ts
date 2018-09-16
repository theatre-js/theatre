import pointerFriendlySelector from '$shared/utils/redux/pointerFriendlySelector'
import {ProjectAhistoricState} from '../types'

export const isBlah = pointerFriendlySelector(
  (s: ProjectAhistoricState): boolean => {
    return true
  },
)