import pointerFriendlySelector from '$shared/utils/redux/pointerFriendlySelector'
import {ProjectEphemeralState, ProjectLoadedState} from '../types'
import {valOrRead} from '$shared/DataVerse2/atom'

export const isReady = pointerFriendlySelector(
  (s: ProjectEphemeralState): boolean => {
    return valOrRead(s.loadingState.type) === 'loaded'
  },
)

export const getDiskRevisionsBrowserStateIsBasedOn = pointerFriendlySelector(
  (s: ProjectEphemeralState) => {
    return ((s.loadingState as $IntentionalAny) as ProjectLoadedState)
      .diskRevisionsThatBrowserStateIsBasedOn
  },
)
