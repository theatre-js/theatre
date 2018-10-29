import reducto from '$shared/utils/redux/reducto'
import {$UIAhistoricState, UIAhistoricState} from '$tl/ui/store/types'
import {TimelineAddress, ProjectAddress} from '$tl/handy/addresses'
import {TRange} from '$tl/ui/panels/AllInOnePanel/Right/types'
import uiSelectors from '$tl/ui/store/selectors'

const r = reducto($UIAhistoricState)

const ensureProjectIsSetUp = (
  s: UIAhistoricState,
  {projectId}: ProjectAddress,
) => {
  const {projects} = s.allInOnePanel
  if (!projects[projectId]) {
    s.allInOnePanel.projects[projectId] = {
      timelines: {},
    }
  }
}

const ensureTimelineIsSetUp = (s: UIAhistoricState, addr: TimelineAddress) => {
  ensureProjectIsSetUp(s, addr)
  const {timelines} = s.allInOnePanel.projects[addr.projectId]
  if (!timelines[addr.timelinePath]) {
    s.allInOnePanel.projects[addr.projectId].timelines[addr.timelinePath] = {
      rangeShownInPanel: undefined,
      objects: {},
    }
  }
}

export const setUIVisibilityState = r(
  (s, p: UIAhistoricState['visibilityState']) => {
    s.visibilityState = p
  },
)

export const setRangeShownInPanel = r(
  (s, p: TimelineAddress & {range: TRange}) => {
    console.trace()
    ensureTimelineIsSetUp(s, p)
    const timeline = uiSelectors.ahistoric.getTimelineState(s, p)
    timeline.rangeShownInPanel = p.range
  },
)

export const __unsafeReplaceWholeState = r((_, p: UIAhistoricState) => {
  return p
})
