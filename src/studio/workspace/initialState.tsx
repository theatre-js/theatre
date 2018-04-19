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
            path: ['explore', 'right'],
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
      explore: {
        id: 'explore',
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
            path: ['explore', 'left'],
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
          selectedNode: 'explore',
        },
        outputs: {},
      },
    },
    listOfVisibles: ['timelinePanel', 'explore', 'composePanel-imAUUID'],
    idOfActivePanel: 'explore',
    panelObjectBeingDragged: null,
  },
  componentIdToBeRenderedAsCurrentCanvas: 'IntroScene',

  viewports: {

    byId: {
      viewport1: {
        id: 'viewport1',
        dimensions: {width: 520, height: 220},
        position: {x: 300, y: 60},
        sceneComponentId: 'IntroScene',
      },
      viewport2: {
        id: 'viewport2',
        dimensions: {width: 300, height: 220},
        position: {x: 870, y: 60},
        sceneComponentId: 'IntroScene',
      },
    },
    whatToShowInBody: {type: 'Viewports'},
    activeViewportId: 'viewport1'
  },
}

export default initialState
