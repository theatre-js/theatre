import type {OnDiskState} from '@theatre/core/projects/store/storeTypes'
import type TheatreProject from '@theatre/core/projects/TheatreProject'
import type Sheet from '@theatre/core/sheets/Sheet'
import SheetTemplate from '@theatre/core/sheets/SheetTemplate'
import type {Studio} from '@theatre/studio/Studio'
import type {ProjectAddress} from '@theatre/shared/utils/addresses'
import type {Pointer} from '@theatre/dataverse'
import {PointerProxy} from '@theatre/dataverse'
import {Atom} from '@theatre/dataverse'
import initialiseProjectState from './initialiseProjectState'
import projectsSingleton from './projectsSingleton'
import type {ProjectState} from './store/storeTypes'
import type {Deferred} from '@theatre/shared/utils/defer'
import {defer} from '@theatre/shared/utils/defer'
import globals from '@theatre/shared/globals'
import type {
  ProjectId,
  SheetId,
  SheetInstanceId,
} from '@theatre/shared/utils/ids'
import type {
  ILogger,
  ITheatreLoggerConfig,
  ITheatreLoggingConfig,
} from '@theatre/shared/logger'
import {_coreLogger} from '@theatre/core/_coreLogger'

export type Conf = Partial<{
  state: OnDiskState
  experiments: ExperimentsConf
}>

export type ExperimentsConf = Partial<{
  logger: ITheatreLoggerConfig
  logging: ITheatreLoggingConfig
}>

export default class Project {
  readonly pointers: {
    historic: Pointer<ProjectState['historic']>
    ahistoric: Pointer<ProjectState['ahistoric']>
    ephemeral: Pointer<ProjectState['ephemeral']>
  }

  private readonly _pointerProxies: {
    historic: PointerProxy<ProjectState['historic']>
    ahistoric: PointerProxy<ProjectState['ahistoric']>
    ephemeral: PointerProxy<ProjectState['ephemeral']>
  }

  readonly address: ProjectAddress

  private readonly _readyDeferred: Deferred<undefined>

  private _sheetTemplates = new Atom<{
    [sheetId: string]: SheetTemplate | undefined
  }>({})
  sheetTemplatesP = this._sheetTemplates.pointer
  private _studio: Studio | undefined

  type: 'Theatre_Project' = 'Theatre_Project'
  readonly _logger: ILogger

  constructor(
    id: ProjectId,
    readonly config: Conf = {},
    readonly publicApi: TheatreProject,
  ) {
    this._logger = _coreLogger(config.experiments).named('Project', id)
    this._logger.traceDev('creating project')
    this.address = {projectId: id}

    // remove when logger is understood
    this._logger._kapow('this is a "kapow"')
    const onDiskStateAtom = new Atom<ProjectState>({
      ahistoric: {
        ahistoricStuff: '',
      },
      historic: config.state ?? {
        sheetsById: {},
        definitionVersion: globals.currentProjectStateDefinitionVersion,
        revisionHistory: [],
      },
      ephemeral: {
        loadingState: {
          type: 'loaded',
        },
        lastExportedObject: null,
      },
    })

    this._pointerProxies = {
      historic: new PointerProxy(onDiskStateAtom.pointer.historic),
      ahistoric: new PointerProxy(onDiskStateAtom.pointer.ahistoric),
      ephemeral: new PointerProxy(onDiskStateAtom.pointer.ephemeral),
    }

    this.pointers = {
      historic: this._pointerProxies.historic.pointer,
      ahistoric: this._pointerProxies.ahistoric.pointer,
      ephemeral: this._pointerProxies.ephemeral.pointer,
    }

    projectsSingleton.add(id, this)

    this._readyDeferred = defer()

    if (config.state) {
      setTimeout(() => {
        // The user has provided config.state but in case @theatre/studio is loaded,
        // let's give it one tick to attach itself
        if (!this._studio) {
          this._readyDeferred.resolve(undefined)
          this._logger._trace('ready deferred resolved with no state')
        }
      }, 0)
    } else {
      setTimeout(() => {
        if (!this._studio) {
          throw new Error(
            `Argument config.state in Theatre.getProject("${id}", config) is empty. This is fine ` +
              `while you are using @theatre/core along with @theatre/sutdio. But since @theatre/studio ` +
              `is not loaded, the state of project "${id}" will be empty.\n\n` +
              `To fix this, you need to add @theatre/studio into the bundle and export ` +
              `the projet's state. Learn how to do that at https://docs.theatrejs.com/in-depth/#exporting`,
          )
        }
      }, 1000)
    }
  }

  attachToStudio(studio: Studio) {
    if (this._studio) {
      if (this._studio !== studio) {
        throw new Error(
          `Project ${this.address.projectId} is already attached to studio ${this._studio.address.studioId}`,
        )
      } else {
        this._logger.warnDev(
          `Project ${this.address.projectId} is already attached to studio ${this._studio.address.studioId}`,
        )
        return
      }
    }
    this._studio = studio

    studio.initialized.then(async () => {
      await initialiseProjectState(studio, this, this.config.state)

      this._pointerProxies.historic.setPointer(
        studio.atomP.historic.coreByProject[this.address.projectId],
      )
      this._pointerProxies.ahistoric.setPointer(
        studio.atomP.ahistoric.coreByProject[this.address.projectId],
      )
      this._pointerProxies.ephemeral.setPointer(
        studio.atomP.ephemeral.coreByProject[this.address.projectId],
      )

      this._readyDeferred.resolve(undefined)
    })
  }

  get isAttachedToStudio() {
    return !!this._studio
  }

  get ready() {
    return this._readyDeferred.promise
  }

  isReady() {
    return this._readyDeferred.status === 'resolved'
  }

  getOrCreateSheet(
    sheetId: SheetId,
    instanceId: SheetInstanceId = 'default' as SheetInstanceId,
  ): Sheet {
    let template = this._sheetTemplates.getState()[sheetId]

    if (!template) {
      template = new SheetTemplate(this, sheetId)
      this._sheetTemplates.setIn([sheetId], template)
    }

    return template.getInstance(instanceId)
  }
}
