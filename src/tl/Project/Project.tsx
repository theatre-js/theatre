import projectsSingleton from './projectsSingleton'

export default class Project {
  static version = process.env.tl.version
  /**
   * @todo should we have a human-readable name for each project too?
   */
  constructor(readonly id: string) {
    projectsSingleton.add(id, this)
  }
}
