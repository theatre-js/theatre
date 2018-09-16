import pointerFriendlySelector from '$shared/utils/redux/pointerFriendlySelector'
import {ProjectEphemeralState, ProjectLoadedState} from '../types'
import {val} from '$shared/DataVerse2/atom'

export const isReady = pointerFriendlySelector(
  (s: ProjectEphemeralState): boolean => {
    return val(s.loadingState.type) === 'loaded'
  },
)

export const getDiskRevisionsBrowserStateIsBasedOn = pointerFriendlySelector(
  (s: ProjectEphemeralState) => {
    return ((s.loadingState as $IntentionalAny) as ProjectLoadedState)
      .diskRevisionsThatBrowserStateIsBasedOn
  },
)
