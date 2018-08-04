import UI from '$tl/ui/UI'
import {val} from '$shared/DataVerse2/atom'
import projectsSingleton from '$tl/Project/projectsSingleton'
import Project from '$tl/Project/Project'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import TimelineInstance from '$tl/timelines/TimelineInstance'

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

export const getProjectSelectionState = (
  ui: UI,
): {projects: Record<string, Project>} & (
  | {areThereProjects: false; selectedProject: undefined}
  | {areThereProjects: true; selectedProject: Project}) => {
  const projects = val(projectsSingleton.atom.pointer.projects)
  const areThereProjects = Object.keys(projects).length > 0

  const selectedProject = getSelectedProject(ui)

  return {
    projects,
    areThereProjects,
    selectedProject,
  } as any
}

export const getSelectedInternalTimeline = (
  ui: UI,
  project: Project,
): undefined | InternalTimeline => {
  const infoOfUserDesiredTimeline = val(
    ui.atomP.historic.allInOnePanel.selectedTimelineByProject[project.id],
  )

  if (infoOfUserDesiredTimeline) {
    const pathOfUserDesiredInternalTimeline = val(
      project._internalTimelines.pointer[
        infoOfUserDesiredTimeline.internalTimelinePath
      ],
    )
    if (pathOfUserDesiredInternalTimeline)
      return pathOfUserDesiredInternalTimeline
  }
  const internalTimelines = val(project._internalTimelines.pointer)

  const timelinePaths = Object.keys(internalTimelines)
  const areThereTimelines = timelinePaths.length > 0
  if (!areThereTimelines) return undefined

  return internalTimelines[timelinePaths[0]]
}
