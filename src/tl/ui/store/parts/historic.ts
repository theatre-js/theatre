import reducto from '$shared/utils/redux/reducto'
import {$UIHistoricState, UIHistoricState} from '$tl/ui/store/types'

const r = reducto($UIHistoricState)

export const selectProject = r((s, p: string) => {
  s.allInOnePanel.selectedProject = p
})

const ensureProjectIsSetUp = (s: UIHistoricState, projectId: string) => {
  const {projects} = s.allInOnePanel
  if (!projects[projectId]) {
    s.allInOnePanel.projects[projectId] = {
      selectedTimeline: null,
      timelines: {},
    }
  }
}

const ensureTimelineIsSetUp = (
  s: UIHistoricState,
  projectId: string,
  timelinePath: string,
) => {
  ensureProjectIsSetUp(s, projectId)
  const {timelines} = s.allInOnePanel.projects[projectId]
  if (!timelines[timelinePath]) {
    s.allInOnePanel.projects[projectId].timelines[timelinePath] = {
      selectedTimelineInstance: null,
      objects: {},
    }
  }
}

export const setSelectedTimeline = r(
  (s, p: {projectId: string; internalTimelinePath: string}) => {
    ensureProjectIsSetUp(s, p.projectId)
    s.allInOnePanel.projects[p.projectId].selectedTimeline =
      p.internalTimelinePath
  },
)

export const setActiveTimelineInstanceId = r(
  (
    s,
    p: {projectId: string; internalTimelinePath: string; instanceId: string},
  ) => {
    ensureTimelineIsSetUp(s, p.projectId, p.internalTimelinePath)

    s.allInOnePanel.projects[p.projectId].timelines[
      p.internalTimelinePath
    ].selectedTimelineInstance =
      p.instanceId
  },
)
