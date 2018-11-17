import Project from './Project'
import {Atom} from '$shared/DataVerse/atom'

export interface State {
  projects: Record<string, Project>
}

class ProjectsSingleton {
  atom: Atom<State>
  constructor() {
    this.atom = new Atom({projects: {}})
  }

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

const SINGLETON_SYMBOL = '__studiojsProjectsSingleton'

if (!(window as $IntentionalAny)[SINGLETON_SYMBOL])
  (window as $IntentionalAny)[SINGLETON_SYMBOL] = new ProjectsSingleton()

const singleton: ProjectsSingleton = (window as $IntentionalAny)[
  SINGLETON_SYMBOL
]

export default singleton
