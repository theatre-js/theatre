import Scrub from '@theatre/studio/Scrub'
import type {FullStudioState} from '@theatre/studio/store'
import type {StudioHistoricState} from '@theatre/studio/store/types/historic'
import UI from '@theatre/studio/UI'
import type {Pointer} from '@theatre/dataverse'
import {Atom, PointerProxy, valueDerivation} from '@theatre/dataverse'
import type {
  CommitOrDiscard,
  ITransactionPrivateApi,
} from './StudioStore/StudioStore'
import StudioStore from './StudioStore/StudioStore'
import type {IStudio} from './TheatreStudio'
import TheatreStudio from './TheatreStudio'
import {nanoid} from 'nanoid/non-secure'
import type Project from '@theatre/core/projects/Project'
import type {CoreBits} from '@theatre/core/CoreBundle'
import type {privateAPI} from '@theatre/core/privateAPIs'

export class Studio {
  readonly atomP: Pointer<FullStudioState>
  readonly ui!: UI
  readonly publicApi: IStudio
  readonly address: {studioId: string}
  readonly _projectsProxy: PointerProxy<Record<string, Project>> =
    new PointerProxy(new Atom({}).pointer)

  readonly projectsP: Pointer<Record<string, Project>> =
    this._projectsProxy.pointer

  private readonly _store = new StudioStore()
  private _corePrivateApi: typeof privateAPI | undefined

  constructor() {
    this.address = {studioId: nanoid(10)}
    this.publicApi = new TheatreStudio(this)
    this.atomP = this._store.atomP

    if (process.env.NODE_ENV !== 'test') {
      this.ui = new UI(this)
    }

    this._attachToIncomingProjects()
  }

  get initialized() {
    return this._store.initialized
  }

  _attachToIncomingProjects() {
    const projectsD = valueDerivation(this.projectsP)

    const attachToProjects = (projects: Record<string, Project>) => {
      for (const project of Object.values(projects)) {
        if (!project.isAttachedToStudio) {
          project.attachToStudio(this)
        }
      }
    }
    projectsD.changesWithoutValues().tap(() => {
      attachToProjects(projectsD.getValue())
    })
    attachToProjects(projectsD.getValue())
  }

  setCoreBits(coreBits: CoreBits) {
    this._corePrivateApi = coreBits.privateAPI
    this._setProjectsP(coreBits.projectsP)
  }

  private _setProjectsP(projectsP: Pointer<Record<string, Project>>) {
    this._projectsProxy.setPointer(projectsP)
  }

  scrub() {
    return new Scrub(this)
  }

  tempTransaction(fn: (api: ITransactionPrivateApi) => void): CommitOrDiscard {
    return this._store.tempTransaction(fn)
  }

  transaction(fn: (api: ITransactionPrivateApi) => void): void {
    return this.tempTransaction(fn).commit()
  }

  __dev_startHistoryFromScratch(newHistoricPart: StudioHistoricState) {
    return this._store.__dev_startHistoryFromScratch(newHistoricPart)
  }

  get corePrivateAPI() {
    return this._corePrivateApi
  }
}
