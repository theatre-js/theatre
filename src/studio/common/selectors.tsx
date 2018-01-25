// @flow
import {Selector} from '$studio/types'

export const getIsBootstrapped: Selector<boolean, *> = state =>
  state.common.temp.bootstrapped
