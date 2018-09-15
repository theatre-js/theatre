import pointerFriendlySelector from '$shared/utils/redux/pointerFriendlySelector'
import {ProjectAhistoricState, ProjectLoadedState} from '../types'
import {valOrRead} from '$shared/DataVerse2/atom'

const isReady = pointerFriendlySelector(
  (s: ProjectAhistoricState): boolean => {
    return valOrRead(s.loadingState.type) === 'loaded'
  },
)

const getDiskRevisionsBrowserStateIsBasedOn = pointerFriendlySelector(
  (s: ProjectAhistoricState) => {
    return ((s.loadingState as $IntentionalAny) as ProjectLoadedState)
      .diskRevisionsThatBrowserStateIsBasedOn
  },
)

const projectAhistoricSelectors = {
  isReady,
  getDiskRevisionsBrowserStateIsBasedOn,
}

export default projectAhistoricSelectors
