import {Selector} from '$lf/types'

export const getIsBootstrapped: Selector<boolean, void> = state =>
  state.common.temp.bootstrapped
