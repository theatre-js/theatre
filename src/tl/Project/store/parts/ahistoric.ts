import reducto from '$shared/utils/redux/reducto'
import {$ProjectAhistoricState} from '$tl/Project/store/types'

const r = reducto($ProjectAhistoricState)

export const foo = r(
  (s, p: string) => {
  },
)
