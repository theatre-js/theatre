import reducto from '$shared/utils/redux/reducto'
import {$UIHistoricState} from '$tl/ui/store/types'

const r = reducto($UIHistoricState)

export const setFoo = r(
  (s, p: string) => {
    s.foo = p
  },
)
