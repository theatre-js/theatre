import {
  IWorkspaceHistoricState,
  IWorkspaceAhistoricState,
} from './types'

export const ahistoricWorkspaceInitialState: IWorkspaceAhistoricState = {
  activeNodeVolatileIdByViewportId: {},
  viewportsContainer: {
    scrollX: 0,
    scrollY: 0,
  },
}

export const historicWorkspaceInitialState: IWorkspaceHistoricState = {
  panels: {
    byId: {
      timelinePanel: {
        id: 'timelinePanel',
        type: 'AnimationTimelinePanel',
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
            distance: -388,
          },
          bottom: {
            type: 'sameAsBoundary',
            path: ['window', 'bottom'],
          },
        },
      },
      explore: {
        id: 'explore',
        type: 'ExploreFlyoutMenu',

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
      },
      leftPanel: {
        id: 'leftPanel',
        type: 'LeftPanel',
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
      },
      rightPanel: {
        id: 'rightPanel',
        type: 'AllInOnePanel',

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
