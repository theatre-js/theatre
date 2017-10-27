// @flow
import type {Selector} from '$studio/types'
import type {PathToInspectable} from './types'
import * as componentModelSelectors from '$studio/componentModel/selectors'

export const pathToInspectable: Selector<*, *> = (state) => state.x2.pathToInspectable

export const getInspectableByPath: Selector<*, *> = (state, path: PathToInspectable) => {
  if (path.localHiddenValueId)
    componentModelSelectors.getLocalHiddenValueDescriptorByPath(state, path)
  else
    throw new Error(`Not implemented`)
}
