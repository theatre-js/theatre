import reducto from '$shared/utils/redux/reducto'
import {$UIHistoricState, UIHistoricState} from '$tl/ui/store/types'
import uiSelectors from '../selectors'
import {
  ProjectAddress,
  TimelineAddress,
  PropAddress,
  TimelineInstanceAddress,
  ObjectAddress,
} from '$tl/handy/addresses'

const r = reducto($UIHistoricState)

export const selectProject = r((s, addr: ProjectAddress) => {
  s.allInOnePanel.selectedProject = addr.projectId
})

const ensureProjectIsSetUp = (
  s: UIHistoricState,
  {projectId}: ProjectAddress,
) => {
  const {projects} = s.allInOnePanel
  if (!projects[projectId]) {
    s.allInOnePanel.projects[projectId] = {
      selectedTimeline: null,
      timelines: {},
    }
  }
}

const ensureTimelineIsSetUp = (s: UIHistoricState, addr: TimelineAddress) => {
  ensureProjectIsSetUp(s, addr)
  const {timelines} = s.allInOnePanel.projects[addr.projectId]
  if (!timelines[addr.timelinePath]) {
    s.allInOnePanel.projects[addr.projectId].timelines[addr.timelinePath] = {
      selectedTimelineInstance: null,
      objects: {},
    }
  }
}

export const setSelectedTimeline = r((s, addr: TimelineAddress) => {
  ensureProjectIsSetUp(s, addr)

  s.allInOnePanel.projects[addr.projectId].selectedTimeline = addr.timelinePath
})

export const setActiveTimelineInstanceId = r(
  (s, p: TimelineInstanceAddress) => {
    ensureTimelineIsSetUp(s, p)

    s.allInOnePanel.projects[p.projectId].timelines[
      p.timelinePath
    ].selectedTimelineInstance =
      p.timelineInstanceId
  },
)

const ensureObjectIsSetUp = (s: UIHistoricState, addr: ObjectAddress) => {
  ensureTimelineIsSetUp(s, addr)
  const timeline = uiSelectors.getTimelineState(s, addr)
  const {objects} = timeline

  if (!objects[addr.objectPath]) {
    objects[addr.objectPath] = {
      activePropsList: [],
      props: {},
    }
  }
}

const ensurePropIsSetUp = (s: UIHistoricState, addr: PropAddress) => {
  ensureObjectIsSetUp(s, addr)
  const props = uiSelectors.getObjectState(s, addr).props

  if (!props[addr.propKey]) {
    props[addr.propKey] = {
      expanded: false,
      heightWhenExpanded: 200,
    }
  }
}

export const setPropExpansion = r((s, p: PropAddress & {expanded: boolean}) => {
  ensurePropIsSetUp(s, p)
  const propState = uiSelectors.getPropState(s, p)
  propState.expanded = p.expanded
})

export const setPropHeightWhenExpanded = r(
  (
    s,
    p: PropAddress & {
      height: number
    },
  ) => {
    ensurePropIsSetUp(s, p)
    const propState = uiSelectors.getPropState(s, p)
    propState.heightWhenExpanded = p.height
  },
)
