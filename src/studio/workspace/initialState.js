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
            x: 20,
            y: 100,
          },
        },
        inputs: {},
        outputs: {},
      },
      theX1: {
        id: 'theX1',
        type: 'x1',
        persistentState: {
          isInSettings: false,
        },
        configuration: {
          foo: 'bar',
        },
        placementSettings: {
          pos: {
            x: 20,
            y: 0,
          },
          dim: {
            x: 30,
            y: 100,
          },
        },
        inputs: {
          selectedNode: 'elementTree',
        },
        outputs: {},
      },
      theX2: {
        id: 'theX2',
        type: 'x2',
        persistentState: {
          isInSettings: false,
        },
        configuration: {
          foo: 'bar',
        },
        placementSettings: {
          pos: {
            x: 80,
            y: 0,
          },
          dim: {
            x: 20,
            y: 100,
          },
        },
        inputs: {},
        outputs: {},
      },
    },
    idOfActivePanel: 'elementTree',
    listOfVisibles: ['theX2', 'elementTree', 'theX1'],
    currentlyDraggingOutput: null,
  },
  componentIdToBeRenderedAsCurrentCanvas: 'FakeDeclarativeButton',
}

export default initialState
