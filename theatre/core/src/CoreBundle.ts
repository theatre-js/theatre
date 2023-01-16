import type {Studio} from '@theatre/studio/Studio'
import projectsSingleton from './projects/projectsSingleton'
import {privateAPI} from './privateAPIs'
import * as coreExports from './coreExports'
import {getCoreRafDriver} from './coreTicker'

export type CoreBits = {
  projectsP: typeof projectsSingleton.atom.pointer.projects
  privateAPI: typeof privateAPI
  coreExports: typeof coreExports
  getCoreRafDriver: typeof getCoreRafDriver
}

export default class CoreBundle {
  private _studio: Studio | undefined = undefined
  constructor() {}

  get type(): 'Theatre_CoreBundle' {
    return 'Theatre_CoreBundle'
  }

  get version() {
    return process.env.THEATRE_VERSION
  }

  getBitsForStudio(studio: Studio, callback: (bits: CoreBits) => void) {
    if (this._studio) {
      throw new Error(`@theatre/core is already attached to @theatre/studio`)
    }
    this._studio = studio
    const bits: CoreBits = {
      projectsP: projectsSingleton.atom.pointer.projects,
      privateAPI: privateAPI,
      coreExports,
      getCoreRafDriver,
    }

    callback(bits)
  }
}
