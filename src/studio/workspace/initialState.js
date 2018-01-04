// @flow
import {type WorkspaceNamespaceState} from './types'

const initialState: WorkspaceNamespaceState = {
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
            x: 15,
            y: 60,
          },
          dim: {
            x: 70,
            y: 40,
          },
        },
        inputs: {},
        outputs: {},
      },
      elementTree: {
        id: 'elementTree',
        type: 'elementTree',
        persistentState: {
          isInSettings: false,
        },
        configuration: {
          foo: 'bar',
        },
        placementSettings: {
          pos: {
            x: 0,
            y: 0,
          },
          dim: {
            x: 15,
            y: 100,
          },
        },
        inputs: {},
        outputs: {},
      },
      'composePanel-imAUUID': {
        id: 'composePanel-imAUUID',
        type: 'compose',
        persistentState: {
          isInSettings: false,
        },
        configuration: {
          foo: 'bar',
        },
        placementSettings: {
          pos: {
            x: 85,
            y: 0,
          },
          dim: {
            x: 15,
            y: 100,
          },
        },
        inputs: {
          selectedNode: 'elementTree',
        },
        outputs: {},
      },
    },
    listOfVisibles: ['8daa7380-9b43-475a-8352-dc564a58c719', 'composePanel-imAUUID', 'elementTree'],
    idOfActivePanel: 'elementTree',
    currentlyDraggingOutput: null,
  },
  componentIdToBeRenderedAsCurrentCanvas: 'FakeDeclarativeButton',
}

export default initialState
