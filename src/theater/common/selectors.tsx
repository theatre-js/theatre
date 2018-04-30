import {Selector} from '$theater/types'

export const getIsHydrated: Selector<boolean, void> = state =>
  state.stateIsHydrated
