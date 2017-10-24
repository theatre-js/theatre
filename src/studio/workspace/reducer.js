// @flow
import type {WorkspaceNamespaceState} from './types'

const defaultState: WorkspaceNamespaceState = {
  panels: {
    byId: {
      '8daa7380-9b43-475a-8352-dc564a58c719': {
        id: '8daa7380-9b43-475a-8352-dc564a58c719',
        type: 'animationTimeline',
        persistentState: {
          isInSettings: false,
        },
        configuration: {
          timelineId: '8daa7380-9b43-475a-8352-dc564a58c710',
        },
        placementSettings: {
          pos: {
            x: 20,
            y: 25,
          },
          dim: {
            x: 60,
            y: 50,
          },
        },
        inputs: {},
        outputs: {},
      },
    },
    listOfVisibles: ['8daa7380-9b43-475a-8352-dc564a58c719'],
    currentlyDraggingOutput: null,
  },
  componentIdToBeRenderedAsCurrentCanvas: undefined,
}

export default (state: WorkspaceNamespaceState = defaultState) => state