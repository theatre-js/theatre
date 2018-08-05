import reducto from '$shared/utils/redux/reducto'
import {$UIHistoricState} from '$tl/ui/store/types'
import {combineProjectAndTimelinePath} from '$tl/ui/panels/AllInOnePanel/selectors'

const r = reducto($UIHistoricState)

export const selectProject = r((s, p: string) => {
  s.allInOnePanel.selectedProject = p
})

export const setSelectedTimeline = r(
  (s, p: {projectId: string; internalTimelinePath: string}) => {
    s.allInOnePanel.selectedTimelineByProject[p.projectId] =
      p.internalTimelinePath
  },
)

export const setActiveTimelineInstanceId = r(
  (
    s,
    p: {projectId: string; internalTimelinePath: string; instanceId: string},
  ) => {
    s.allInOnePanel.selectedTimelineInstanceByProjectAndTimeline[
      combineProjectAndTimelinePath(p.projectId, p.internalTimelinePath)
    ] =
      p.instanceId
  },
)
