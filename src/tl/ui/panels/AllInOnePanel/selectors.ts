import UI from '$tl/ui/UI'
import {val} from '$shared/DataVerse/atom'
import projectsSingleton from '$tl/Project/projectsSingleton'
import Project from '$tl/Project/Project'
import TimelineTemplate from '$tl/timelines/TimelineTemplate'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import uiSelectors from '$tl/ui/store/selectors'

export const getProjectSelectionState = (
  ui: UI,
): {projects: Record<string, Project>} & (
  | {areThereProjects: false; selectedProject: undefined}
  | {areThereProjects: true; selectedProject: Project}) => {
  const projects = val(projectsSingleton.atom.pointer.projects)
  const areThereProjects = Object.keys(projects).length > 0

  const selectedProject = uiSelectors.historic.getSelectedProject(ui)

  return {
    projects,
    areThereProjects,
    selectedProject,
  } as any
}

export const getSelectedTimelineTemplate = (
  ui: UI,
  project: Project,
): undefined | TimelineTemplate => {
  const userSelectedTimelinePath = val(
    ui.atomP.historic.allInOnePanel.projects[project.id].selectedTimeline,
  )

  if (userSelectedTimelinePath) {
    const userSelectedTimelineTemplate = val(
      project._timelineTemplates.pointer[userSelectedTimelinePath],
    )

    if (userSelectedTimelineTemplate) return userSelectedTimelineTemplate
  }
  const timelineTemplates = val(project._timelineTemplates.pointer)

  const timelinePaths = Object.keys(timelineTemplates)
  const areThereTimelines = timelinePaths.length > 0
  if (!areThereTimelines) return undefined

  return timelineTemplates[timelinePaths[0]]
}

export const getSelectedTimelineInstance = (
  ui: UI,
  project: Project,
  timelineTemplate: TimelineTemplate,
): undefined | TimelineInstance => {
  const userDesiredInstanceId = val(
    ui.atomP.historic.allInOnePanel.projects[project.id].timelines[
      timelineTemplate._path
    ].selectedTimelineInstance,
  )

  if (userDesiredInstanceId) {
    const possibleInstance = val(
      project._timelineInstances.pointer[timelineTemplate._path][
        userDesiredInstanceId
      ],
    )

    if (possibleInstance) return possibleInstance
  }

  const instances = val(
    project._timelineInstances.pointer[timelineTemplate._path],
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
  timelineTemplate: TimelineTemplate,
) => {
  const instances = val(
    project._timelineInstances.pointer[timelineTemplate._path],
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
  timelineTemplate: TimelineTemplate
  timelineInstance: TimelineInstance
} => {
  const project = uiSelectors.historic.getSelectedProject(ui)
  const timelineTemplate = project
    ? getSelectedTimelineTemplate(ui, project)
    : undefined

  const timelineInstance = timelineTemplate
    ? getSelectedTimelineInstance(
        ui,
        project as $IntentionalAny,
        timelineTemplate,
      )
    : undefined

  return {project, timelineTemplate, timelineInstance} as $IntentionalAny
}
