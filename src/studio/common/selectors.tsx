import {Selector} from '$studio/types'

export const getIsHydrated: Selector<boolean, void> = state =>
  state.stateIsHydrated
