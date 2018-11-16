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
  let timeline = timelines[addr.timelinePath]
  if (!timeline) {
    timeline = s.allInOnePanel.projects[addr.projectId].timelines[
      addr.timelinePath
    ] = {
      selectedTimelineInstance: null,
      objects: {},
      collapsedNodesByPath: {},
      temporaryPlaybackRangeLimit: undefined,
    }
  }
  return timeline
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
  const timeline = uiSelectors.historic.getTimelineState(s, addr)
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
  const props = uiSelectors.historic.getObjectState(s, addr).props

  if (!props[addr.propKey]) {
    props[addr.propKey] = {
      expanded: false,
      heightWhenExpanded: 200,
    }
  }
}

export const setPropExpansion = r((s, p: PropAddress & {expanded: boolean}) => {
  ensurePropIsSetUp(s, p)
  const propState = uiSelectors.historic.getPropState(s, p)
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
    const propState = uiSelectors.historic.getPropState(s, p)
    propState.heightWhenExpanded = p.height
  },
)

export const setPropExpansionAndHeight = r(
  (s, p: PropAddress & {expanded: boolean; height: number}) => {
    setPropExpansion.originalReducer(s, p)
    setPropHeightWhenExpanded.originalReducer(s, p)
  },
)

export const setNodeExpansion = r(
  (s, p: TimelineAddress & {expanded: boolean; nodePath: string}) => {
    ensureTimelineIsSetUp(s, p)
    const {collapsedNodesByPath} = uiSelectors.historic.getTimelineState(s, p)
    if (p.expanded === false) {
      collapsedNodesByPath[p.nodePath] = 1
    } else {
      delete collapsedNodesByPath[p.nodePath]
    }
  },
)

export const setAllInOnePanelMargins = r(
  (s, p: {newMargins: UIHistoricState['allInOnePanel']['margins']}) => {
    s.allInOnePanel.margins = p.newMargins
  },
)

export const setTemporaryPlaybackRangeLimitOfTimeline = r(
  (s, p: {limit: {from: number; to: number} | undefined} & TimelineAddress) => {
    ensureTimelineIsSetUp(s, p).temporaryPlaybackRangeLimit = p.limit
  },
)
