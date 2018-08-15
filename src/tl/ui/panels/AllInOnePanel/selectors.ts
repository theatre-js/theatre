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
  const userSelectedTimelinePath = val(
    ui.atomP.historic.allInOnePanel.projects[project.id].selectedTimeline,
  )

  if (userSelectedTimelinePath) {
    const userSelectedInternalTimeline = val(
      project._internalTimelines.pointer[userSelectedTimelinePath],
    )

    if (userSelectedInternalTimeline) return userSelectedInternalTimeline
  }
  const internalTimelines = val(project._internalTimelines.pointer)

  const timelinePaths = Object.keys(internalTimelines)
  const areThereTimelines = timelinePaths.length > 0
  if (!areThereTimelines) return undefined

  return internalTimelines[timelinePaths[0]]
}

export const getSelectedTimelineInstance = (
  ui: UI,
  project: Project,
  internalTimeline: InternalTimeline,
): undefined | TimelineInstance => {
  const userDesiredInstanceId = val(
    ui.atomP.historic.allInOnePanel.projects[project.id].timelines[
      internalTimeline._path
    ].selectedTimelineInstance,
  )

  if (userDesiredInstanceId) {
    const possibleInstance = val(
      project._timelineInstances.pointer[internalTimeline._path][
        userDesiredInstanceId
      ],
    )

    if (possibleInstance) return possibleInstance
  }

  const instances = val(
    project._timelineInstances.pointer[internalTimeline._path],
  )

  if (!instances) debugger
  if (!instances) return

  const isntanceIds = Object.keys(instances)
  const areThereInstances = isntanceIds.length > 0
  if (!areThereInstances) return undefined

  return instances[isntanceIds[0]]
}

export const getTimelineInstances = (
  project: Project,
  internalTimeline: InternalTimeline,
) => {
  const instances = val(
    project._timelineInstances.pointer[internalTimeline._path],
  )

  return instances
}