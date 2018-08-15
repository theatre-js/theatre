import * as ahistoricHandlers from './parts/ahistoric'
import * as historicHandlers from './parts/historic'
import {UIAhistoricState, UIState, UIHistoricState} from '$tl/ui/store/types'
import allInOneStoreBundle from '$shared/utils/redux/allInOneStoreBundle'

const initialHistoricState: UIHistoricState = {
  foo: '1',
  allInOnePanel: {
    projects: {},
    height: 300,
    selectedProject: 'Explorable Explanations',
    leftWidthFraction: 0.3,
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
  UIState,
  typeof historicHandlers,
  typeof ahistoricHandlers
>({
  handlers: {
    historic: historicHandlers,
    ahistoric: ahistoricHandlers,
  },
  initialState: uiInitialState,
})

export {uiActions, rootReducer}
