import Project from '$tl/Project/Project'
import {validateAndSanitiseSlashedPathOrThrow} from '$tl/handy/slashedPaths'
import TheatreTimeline from '$tl/facades/TheatreTimeline'
import {validateName} from '$tl/facades/otherSanitizers'

const projectsWeakmap = new WeakMap<TheatreProject, Project>()

export type TheatreProjectConf = Partial<{
  state: $IntentionalAny
}>

// User-facing facade for Project
export default class TheatreProject {
  constructor(id: string, config: TheatreProjectConf = {}) {
    projectsWeakmap.set(this, new Project(id, config, this))
  }

  getTimeline(_path: string, instanceId: string = 'default'): TheatreTimeline {
    const path = validateAndSanitiseSlashedPathOrThrow(
      _path,
      'project.getTimeline',
    )

    if (!$env.tl.isCore) {
      validateName(
        instanceId,
        'instanceId in project.getTimeline(path, instanceId)',
        true,
      )
    }

    return getProject(this).getTimeline(path, instanceId).facade
  }

  get adapters() {
    return getProject(this).adapters.facade
  }

  get ready() {
    return getProject(this).ready
  }

  get isReady() {
    return getProject(this).isReady()
  }
}

const getProject = (p: TheatreProject) =>
  (projectsWeakmap.get(p) as $IntentionalAny) as Project
