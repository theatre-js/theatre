import {Atom} from '@theatre/dataverse'
import type {ProjectId} from '@theatre/shared/utils/ids'
import type Project from './Project'

interface State {
  projects: Record<ProjectId, Project>
}

class ProjectsSingleton {
  readonly atom = new Atom({projects: {}} as State)
  constructor() {}

  /**
   * We're trusting here that each project id is unique
   */
  add(id: ProjectId, project: Project) {
    this.atom.reduceState(['projects', id], () => project)
  }

  get(id: ProjectId): Project | undefined {
    return this.atom.getState().projects[id]
  }

  has(id: ProjectId) {
    return !!this.get(id)
  }
}

const singleton = new ProjectsSingleton()

export default singleton
