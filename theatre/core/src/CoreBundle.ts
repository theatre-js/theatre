import type Studio from '@theatre/studio/Studio'
import projectsSingleton from './projects/projectsSingleton'

export type CoreBits = {
  projectsP: typeof projectsSingleton.atom.pointer.projects
}

export default class CoreBundle {
  private _studio: Studio | undefined = undefined
  constructor() {}

  get type(): 'Theatre_CoreBundle' {
    return 'Theatre_CoreBundle'
  }

  get version() {
    return $env.version
  }

  getBitsForStudio(studio: Studio, callback: (bits: CoreBits) => void) {
    if (this._studio) {
      throw new Error(`@theatre/core is already attached to @theatre/studio`)
    }
    this._studio = studio
    const bits: CoreBits = {
      projectsP: projectsSingleton.atom.pointer.projects,
    }

    callback(bits)
  }
}
