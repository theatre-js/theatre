import {ProjectState} from '$tl/Project/store/types'

export const preloadedHistoryForCore = (
  projectState: $FixMe,
  revision: string,
): ProjectState => {
  const state: ProjectState = {
    ahistoric: {},
    historic: {
      ...projectState,
      '@@history': {
        commitsByHash: {},
        currentCommitHash: undefined,
        innerState: {
          ...projectState,
        },
        listOfCommitHashes: [],
      },
      '@@tempActions': [],
    },
    ephemeral: {
      loadingState: {
        type: 'loaded',
        diskRevisionsThatBrowserStateIsBasedOn: [revision],
      },
      lastExportedObject: null,
    },
  }

  return state
}
