import {Selector} from '$studio/types'

export const getIsBootstrapped: Selector<boolean, void> = state =>
  state.persistedState.common.temp.bootstrapped
