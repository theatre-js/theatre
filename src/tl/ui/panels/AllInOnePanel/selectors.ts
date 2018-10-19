import UI from '$tl/ui/UI'
import {val} from '$shared/DataVerse2/atom'
import projectsSingleton from '$tl/Project/projectsSingleton'
import InternalProject from '$tl/Project/InternalProject'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import uiSelectors from '$tl/ui/store/selectors'

export const getProjectSelectionState = (
  ui: UI,
): {projects: Record<string, InternalProject>} & (
  | {areThereProjects: false; selectedProject: undefined}
  | {areThereProjects: true; selectedProject: InternalProject}) => {
  const projects = val(projectsSingleton.atom.pointer.projects)
  const areThereProjects = Object.keys(projects).length > 0

  const selectedProject = uiSelectors.historic.getSelectedProject(ui)

  return {
    projects,
    areThereProjects,
    selectedProject,
  } as any
}

export const getSelectedInternalTimeline = (
  ui: UI,
  internalProject: InternalProject,
): undefined | InternalTimeline => {
  const userSelectedTimelinePath = val(
    ui.atomP.historic.allInOnePanel.projects[internalProject.id].selectedTimeline,
  )

  if (userSelectedTimelinePath) {
    const userSelectedInternalTimeline = val(
      internalProject._internalTimelines.pointer[userSelectedTimelinePath],
    )

    if (userSelectedInternalTimeline) return userSelectedInternalTimeline
  }
  const internalTimelines = val(internalProject._internalTimelines.pointer)

  const timelinePaths = Object.keys(internalTimelines)
  const areThereTimelines = timelinePaths.length > 0
  if (!areThereTimelines) return undefined

  return internalTimelines[timelinePaths[0]]
}

export const getSelectedTimelineInstance = (
  ui: UI,
  internalProject: InternalProject,
  internalTimeline: InternalTimeline,
): undefined | TimelineInstance => {
  const userDesiredInstanceId = val(
    ui.atomP.historic.allInOnePanel.projects[internalProject.id].timelines[
      internalTimeline._path
    ].selectedTimelineInstance,
  )

  if (userDesiredInstanceId) {
    const possibleInstance = val(
      internalProject._timelineInstances.pointer[internalTimeline._path][
        userDesiredInstanceId
      ],
    )

    if (possibleInstance) return possibleInstance
  }

  const instances = val(
    internalProject._timelineInstances.pointer[internalTimeline._path],
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
  internalProject: InternalProject,
  internalTimeline: InternalTimeline,
) => {
  const instances = val(
    internalProject._timelineInstances.pointer[internalTimeline._path],
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
  internalProject: InternalProject
  internalTimeline: InternalTimeline
  timelineInstance: TimelineInstance
} => {
  const internalProject = uiSelectors.historic.getSelectedProject(ui)
  const internalTimeline = internalProject
    ? getSelectedInternalTimeline(ui, internalProject)
    : undefined

  const timelineInstance = internalTimeline
    ? getSelectedTimelineInstance(
        ui,
        internalProject as $IntentionalAny,
        internalTimeline,
      )
    : undefined

  return {internalProject, internalTimeline, timelineInstance} as $IntentionalAny
}
