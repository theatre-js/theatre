import InternalProject, {Conf} from '$tl/Project/InternalProject'
import TimelineInstance from '$tl/timelines/TimelineInstance'

const internalProjectsWeakmap = new WeakMap<Project, InternalProject>()

const getInternalProject = (p: Project) =>
  (internalProjectsWeakmap.get(p) as $IntentionalAny) as InternalProject

// User-facing facade for InternalProject
export default class Project {
  constructor(id: string, config: Conf = {}) {
    internalProjectsWeakmap.set(this, new InternalProject(id, config))
  }

  getTimeline(_path: string, instanceId: string = 'default'): TimelineInstance {
    return getInternalProject(this).getTimeline(_path, instanceId)
  }

  get adapters() {
    return getInternalProject(this).adapters
  }

  get ready() {
    return getInternalProject(this).ready
  }

  get isReady() {
    return getInternalProject(this).isReady
  }
}
