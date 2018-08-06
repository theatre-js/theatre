import {UIState} from './types'

const initialHistoricState = {
  foo: '1',
  allInOnePanel: {
    height: 300,
    selectedProject: 'Explorable Explanations',
    leftWidthFraction: 0.3,
    selectedTimelineByProject: {},
    selectedTimelineInstanceByProjectAndTimeline: {},
  },
}

export const uiInitialState: UIState = {
  ahistoric: {
    visibilityState: 'everythingIsVisible',
    theTrigger: {
      position: {
        closestCorner: 'bottomLeft',
        distanceFromHorizontalEdge: 0.01,
        distanceFromVerticalEdge: 0.02,
      },
    },
  },
  historic: {
    ...initialHistoricState,
    '@@history': {
      commitsByHash: {},
      currentCommitHash: undefined,
      innerState: {
        ...initialHistoricState,
      },
      listOfCommitHashes: [],
    },
    '@@tempActions': [],
  },
  ephemeral: {
    initialised: true,
  },
}
