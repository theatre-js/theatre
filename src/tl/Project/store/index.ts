import * as ahistoricHandlers from './parts/ahistoric'
import * as historicHandlers from './parts/historic'
import {
  ProjectAhistoricState,
  ProjectState,
  ProjectHistoricState,
} from '$tl/Project/store/types'
import allInOneStoreBundle from '$shared/utils/redux/allInOneStoreBundle'

const initialHistoricState: ProjectHistoricState = {
  internalTimeines: {},
}

const projectInitialState: ProjectState = {
  ahistoric: {
    loadingState: {type: 'loading'},
    lastExportedObject: null,
    // stateLoading: {
    //   loaded: false,
    //   browserSateIsNotBasedOnDiskStateError: false,
    //   diskRevisionsThatBrowserStateIsBasedOn: [],
    // },
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

const {actions: projectActions, rootReducer} = allInOneStoreBundle<
  ProjectHistoricState,
  ProjectAhistoricState,
  ProjectState,
  typeof historicHandlers,
  typeof ahistoricHandlers
>({
  handlers: {
    historic: historicHandlers,
    ahistoric: ahistoricHandlers,
  },
  initialState: projectInitialState,
})

export {projectActions, rootReducer}
