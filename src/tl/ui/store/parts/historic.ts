import reducto from '$shared/utils/redux/reducto'
import {$UIHistoricState} from '$tl/ui/store/types'

const r = reducto($UIHistoricState)

export const selectProject = r((s, p: string) => {
  s.allInOnePanel.selectedProject = p
})

export const setSelectedTimeline = r(
  (s, p: {projectId: string; internalTimelinePath: string}) => {
    const existing = s.allInOnePanel.selectedTimelineByProject[p.projectId]
    if (existing) {
      s.allInOnePanel.selectedTimelineByProject[
        p.projectId
      ].internalTimelinePath =
        p.internalTimelinePath
    } else {
      s.allInOnePanel.selectedTimelineByProject[p.projectId] = {
        internalTimelinePath: p.internalTimelinePath,
        instanceId: undefined,
      }
    }
  },
)
