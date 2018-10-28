import {UIHistoricState} from '../types'
import pointerFriendlySelector from '$shared/utils/redux/pointerFriendlySelector'
import {TimelineAddress, ObjectAddress, PropAddress} from '$tl/handy/addresses'
import {val} from '$shared/DataVerse2/atom'
import projectsSingleton from '$tl/Project/projectsSingleton'
import UI from '$tl/ui/UI'
import Project from '$tl/Project/Project'

export const getTimelineState = pointerFriendlySelector(
  (s: UIHistoricState, addr: TimelineAddress) => {
    return s.allInOnePanel.projects[addr.projectId].timelines[addr.timelinePath]
  },
)

export const getCollapsedNodesOfTimelineByPath = pointerFriendlySelector(
  (s: UIHistoricState, addr: TimelineAddress) => {
    return getTimelineState(s, addr).collapsedNodesByPath
  },
)

export const getObjectState = pointerFriendlySelector(
  (s: UIHistoricState, addr: ObjectAddress) => {
    return getTimelineState(s, addr).objects[addr.objectPath]
  },
)

export const getPropState = pointerFriendlySelector(
  (s: UIHistoricState, addr: PropAddress) => {
    return getObjectState(s, addr).props[addr.propKey]
  },
)

/**
 * The selected project is the one that the user has previosuly selected, unless:
 *  - ... that project has not been initialised yet,
 *  - OR that project has been renamed/removed,
 *
 * in which case :
 *  The first project in the list of initialised projects will be selected,
 *  otherwise, undefined.
 *
 * Note that the selected project WILL switch back to the user-defined one
 * if that project gets initialised at any point since the page is loaded.
 */
export const getSelectedProject = (ui: UI): Project | undefined => {
  const projects = val(projectsSingleton.atom.pointer.projects)

  const projectIds = Object.keys(projects)
  const areThereProjects = projectIds.length > 0
  if (!areThereProjects) return undefined

  const selectedProjectId =
    val(ui.atomP.historic.allInOnePanel.selectedProject) || projectIds[0]

  return projects[selectedProjectId] || projects[projectIds[0]]
}

export const getTemporaryPlaybackRangeLimit = pointerFriendlySelector((
  s: UIHistoricState,
  addr: TimelineAddress,
) => {
  return getTimelineState(s, addr).temporaryPlaybackRangeLimit
})
