// @flow
import type {WorkspaceNamespaceState} from './types'

const defaultState: WorkspaceNamespaceState = {
  panels: {
    byId: {},
    listOfVisibles: [],
  },
}

export default (state: WorkspaceNamespaceState = defaultState) => state