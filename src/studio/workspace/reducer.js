// @flow
import type {WorkspaceNamespaceState} from './types'

const defaultState: WorkspaceNamespaceState = {
  panels: {
    byId: {},
    listOfVisibles: [],
    currentlyDraggingOutput: null,
  },
  currentCanvasCommponentID: undefined,
}

export default (state: WorkspaceNamespaceState = defaultState) => state