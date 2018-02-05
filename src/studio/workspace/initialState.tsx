// @flow
import {WorkspaceNamespaceState} from './types'

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
          pathToTimeline: [
            'componentModel',
            'componentDescriptors',
            'custom',
            'IntroScene',
            'timelineDescriptors',
            'byId',
            '8daa7380-9b43-475a-8352-dc564a58c710',
          ],
        },
        boundaries: {
          left: {
            type: 'sameAsBoundary',
            path: ['elementTree', 'right'],
          },
          right: {
            type: 'sameAsBoundary',
            path: ['composePanel-imAUUID', 'left'],
          },
          top: {
            type: 'distanceFromBoundary',
            path: ['8daa7380-9b43-475a-8352-dc564a58c719', 'bottom'],
            distance: -179,
          },
          bottom: {
            type: 'sameAsBoundary',
            path: ['window', 'bottom'],
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
        boundaries: {
          left: {
            type: 'sameAsBoundary',
            path: ['window', 'left'],
          },
          right: {
            type: 'distanceFromBoundary',
            path: ['elementTree', 'left'],
            distance: 228,
          },
          top: {
            type: 'sameAsBoundary',
            path: ['window', 'top'],
          },
          bottom: {
            type: 'sameAsBoundary',
            path: ['window', 'bottom'],
          },
        },
        inputs: {},
        outputs: {
          selectedNode: {
            componentId: 'IntroScene',
          },
        },
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
        boundaries: {
          left: {
            type: 'distanceFromBoundary',
            path: ['composePanel-imAUUID', 'right'],
            distance: -250,
          },
          right: {
            type: 'sameAsBoundary',
            path: ['window', 'right'],
          },
          top: {
            type: 'sameAsBoundary',
            path: ['window', 'top'],
          },
          bottom: {
            type: 'sameAsBoundary',
            path: ['window', 'bottom'],
          },
        },
        inputs: {
          selectedNode: 'elementTree',
        },
        outputs: {},
      },
    },
    listOfVisibles: [
      '8daa7380-9b43-475a-8352-dc564a58c719',
      'elementTree',
      'composePanel-imAUUID',
    ],
    idOfActivePanel: 'elementTree',
    currentlyDraggingOutput: null,
  },
  componentIdToBeRenderedAsCurrentCanvas: 'IntroScene',
}

export default initialState
