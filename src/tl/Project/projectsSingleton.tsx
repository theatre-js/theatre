import Project from './Project'
import {Atom} from '$shared/DataVerse2/atom'

interface State {
  projects: Record<string, Project>
}

class ProjectsSingleton {
  atom: Atom<State>
  constructor() {
    this.atom = new Atom({projects: {}})
  }

  add(id: string, project: Project) {
    if (this.has(id))
      throw new Error(
        `A project with id '${id}' is already initialised. You need to make sure that each project has its own unique id`,
      )
    this.atom.reduceState(['projects', id], () => project)
  }

  get(id: string): Project | undefined {
    return this.atom.getState().projects[id]
  }

  has(id: string) {
    return !!this.get(id)
  }
}

const SINGLETON_SYMBOL = '__theaterjsProjectsSingleton'

if (!(window as $IntentionalAny)[SINGLETON_SYMBOL])
  (window as $IntentionalAny)[SINGLETON_SYMBOL] = new ProjectsSingleton()

const singleton: ProjectsSingleton = (window as $IntentionalAny)[
  SINGLETON_SYMBOL
]

export default singleton
