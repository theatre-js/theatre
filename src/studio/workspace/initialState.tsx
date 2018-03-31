import {WorkspaceNamespaceState} from './types'

const initialState: WorkspaceNamespaceState = {
  panels: {
    byId: {
      timelinePanel: {
        id: 'timelinePanel',
        type: 'AnimationTimelinePanel',
        persistentState: {
          isInSettings: false,
        },
        configuration: {
          pathToTimeline: [
            'historicComponentModel',
            'customComponentDescriptors',
            'BouncyBall',
            'timelineDescriptors',
            'byId',
            'defaultTimeline',
          ],
          // elementId: 1,
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
            path: ['timelinePanel', 'bottom'],
            distance: -188,
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
        type: 'ExplorePanel',
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
            distance: 250,
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
        type: 'ComposePanel',
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
    listOfVisibles: [/*'timelinePanel', 'elementTree', */ 'composePanel-imAUUID'],
    idOfActivePanel: 'elementTree',
    panelObjectBeingDragged: null,
  },
  componentIdToBeRenderedAsCurrentCanvas: 'IntroScene',
}

export default initialState
