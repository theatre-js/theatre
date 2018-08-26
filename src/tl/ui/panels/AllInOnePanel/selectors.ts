import UI from '$tl/ui/UI'
import {val} from '$shared/DataVerse2/atom'
import projectsSingleton from '$tl/Project/projectsSingleton'
import Project from '$tl/Project/Project'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import uiSelectors from '$tl/ui/store/selectors'

export const getProjectSelectionState = (
  ui: UI,
): {projects: Record<string, Project>} & (
  | {areThereProjects: false; selectedProject: undefined}
  | {areThereProjects: true; selectedProject: Project}) => {
  const projects = val(projectsSingleton.atom.pointer.projects)
  const areThereProjects = Object.keys(projects).length > 0

  const selectedProject = uiSelectors.getSelectedProject(ui)

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

  if (!instances) return

  if (instances['default']) {
    return instances['default']
  }

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

/**
 * @note Sometimes there may be no projects selected, or no timelineInstances selected.
 * But for convenience's sake, the function is typed as if these things are always selected.
 */
export const getProjectTimelineAndInstance = (
  ui: UI,
): {
  project: Project
  internalTimeline: InternalTimeline
  timelineInstance: TimelineInstance
} => {
  const project = uiSelectors.getSelectedProject(ui)
  const internalTimeline = project
    ? getSelectedInternalTimeline(ui, project)
    : undefined

  const timelineInstance = internalTimeline
    ? getSelectedTimelineInstance(
        ui,
        project as $IntentionalAny,
        internalTimeline,
      )
    : undefined

  return {project, internalTimeline, timelineInstance} as $IntentionalAny
}
