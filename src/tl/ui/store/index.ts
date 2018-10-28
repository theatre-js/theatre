import * as ahistoricHandlers from './parts/ahistoric'
import * as historicHandlers from './parts/historic'
import * as ephemeralHandlers from './parts/ephemeral'
import {UIAhistoricState, UIState, UIHistoricState} from '$tl/ui/store/types'
import allInOneStoreBundle from '$shared/utils/redux/allInOneStoreBundle'
import {UIEphemeralState} from './types/ephemeral'

const initialHistoricState: UIHistoricState = {
  allInOnePanel: {
    projects: {},
    // height: 300,
    selectedProject: null,
    leftWidthFraction: 0.3,
    margins: {
      left: 0.005,
      top: 0.6,
      right: 0.005,
      bottom: 0.01,
    },
  },
}

const uiInitialState: UIState = {
  ahistoric: {
    visibilityState: 'everythingIsVisible',
    theTrigger: {
      position: {
        closestCorner: 'bottomLeft',
        distanceFromHorizontalEdge: 0.01,
        distanceFromVerticalEdge: 0.02,
      },
    },
    allInOnePanel: {
      projects: {},
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

const {actions: uiActions, rootReducer} = allInOneStoreBundle<
  UIHistoricState,
  UIAhistoricState,
  UIEphemeralState,
  UIState,
  typeof historicHandlers,
  typeof ahistoricHandlers,
  typeof ephemeralHandlers
>({
  handlers: {
    historic: historicHandlers,
    ahistoric: ahistoricHandlers,
    ephemeral: ephemeralHandlers,
  },
  initialState: uiInitialState,
})

export {uiActions, rootReducer}
