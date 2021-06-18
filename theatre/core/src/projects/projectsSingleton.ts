import {Atom} from '@theatre/dataverse'
import type Project from './Project'

interface State {
  projects: Record<string, Project>
}

class ProjectsSingleton {
  readonly atom = new Atom({projects: {}} as State)
  constructor() {}

  /**
   * We're trusting here that each project id is unique
   */
  add(id: string, project: Project) {
    this.atom.reduceState(['projects', id], () => project)
  }

  get(id: string): Project | undefined {
    return this.atom.getState().projects[id]
  }

  has(id: string) {
    return !!this.get(id)
  }
}

const singleton = new ProjectsSingleton()

export default singleton
