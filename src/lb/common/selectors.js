// @flow
import {type Selector} from '$lf/types'

export const getIsBootstrapped: Selector<boolean, *> = state =>
  state.common.temp.bootstrapped
