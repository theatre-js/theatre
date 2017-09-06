// @flow
import type {WorkspaceNamespaceState} from './types'

const defaultState: WorkspaceNamespaceState = {
  panels: {
    byId: {},
    listOfVisibles: [],
  },
  currentCanvasCommponentID: undefined,
}

export default (state: WorkspaceNamespaceState = defaultState) => state