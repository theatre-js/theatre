import {
  IWorkspaceNamespaceHistoricState,
  IWorkspaceNamespaceAHistoricState,
} from './types'

export const ahistoricWorkspaceInitialState: IWorkspaceNamespaceAHistoricState = {
  activeNodeVolatileIdByViewportId: {},
  viewportsContainer: {
    scrollX: 100,
    scrollY: -100,
  }
}

export const historicWorkspaceInitialState: IWorkspaceNamespaceHistoricState = {
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
        },
        boundaries: {
          left: {
            type: 'sameAsBoundary',
            path: ['leftPanel', 'right'],
          },
          right: {
            type: 'sameAsBoundary',
            path: ['rightPanel', 'left'],
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
        type: 'ExploreFlyoutMenu',
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
      leftPanel: {
        id: 'leftPanel',
        type: 'LeftPanel',
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
            path: ['leftPanel', 'left'],
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
        inputs: {
          selectedNode: 'explore',
        },
        outputs: {},
      },
      rightPanel: {
        id: 'rightPanel',
        type: 'RightPanel',
        persistentState: {
          isInSettings: false,
        },
        configuration: {},
        boundaries: {
          left: {
            type: 'distanceFromBoundary',
            path: ['rightPanel', 'right'],
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
        inputs: {},
        outputs: {},
      },
    },
    listOfVisibles: ['leftPanel', 'rightPanel', 'timelinePanel'],
    idOfActivePanel: 'explore',
    panelObjectBeingDragged: null,
  },

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
    activeViewportId: 'viewport1',
  },
}
