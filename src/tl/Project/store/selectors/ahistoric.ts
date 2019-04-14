import pointerFriendlySelector from '$shared/utils/redux/pointerFriendlySelector'
import {ProjectAhistoricState} from '../types'

export const isBlah = pointerFriendlySelector(
  (
    // @ts-ignore
    s: ProjectAhistoricState,
  ): boolean => {
    return true
  },
)
