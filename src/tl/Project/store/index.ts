import * as ahistoricHandlers from './parts/ahistoric'
import * as historicHandlers from './parts/historic'
import * as ephemeralHandlers from './parts/ephemeral'
import {
  ProjectAhistoricState,
  ProjectState,
  ProjectHistoricState,
} from '$tl/Project/store/types'
import allInOneStoreBundle from '$shared/utils/redux/allInOneStoreBundle'
import {ProjectEphemeralState} from './types'

const initialHistoricState: ProjectHistoricState = {
  timelineTemplates: {},
}

const projectInitialState: ProjectState = {
  ahistoric: {
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
    loadingState: {type: 'loading'},
    lastExportedObject: null,
  },
}

const {actions: projectActions, rootReducer} = allInOneStoreBundle<
  ProjectHistoricState,
  ProjectAhistoricState,
  ProjectEphemeralState,
  ProjectState,
  typeof historicHandlers,
  typeof ahistoricHandlers,
  typeof ephemeralHandlers
>({
  handlers: {
    historic: historicHandlers,
    ahistoric: ahistoricHandlers,
    ephemeral: ephemeralHandlers,
  },
  initialState: projectInitialState,
})

export {projectActions, rootReducer}
