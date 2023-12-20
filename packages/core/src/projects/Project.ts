import type {
  OnDiskState,
  ProjectEphemeralState,
  ProjectState,
} from '@theatre/core/types/private/core'
import type TheatreProject from '@theatre/core/projects/TheatreProject'
import type Sheet from '@theatre/core/sheets/Sheet'
import SheetTemplate from '@theatre/core/sheets/SheetTemplate'
// import type {Studio} from '@theatre/studio/Studio'
import type {ProjectAddress} from '@theatre/core/types/public'
import type {Pointer} from '@theatre/dataverse'
import {PointerProxy} from '@theatre/dataverse'
import {Atom} from '@theatre/dataverse'
import initialiseProjectState from './initialiseProjectState'
import projectsSingleton from './projectsSingleton'
import type {Deferred} from '@theatre/utils/defer'
import {defer} from '@theatre/utils/defer'
import {globals} from '@theatre/core/globals'
import type {
  ProjectId,
  SheetId,
  SheetInstanceId,
} from '@theatre/core/types/public'

import type {$IntentionalAny, $____FixmeStudio} from '@theatre/utils/types'
import {InvalidArgumentError} from '@theatre/utils/errors'
import userReadableTypeOfValue from '@theatre/utils/userReadableTypeOfValue'

type Studio = $____FixmeStudio

type ICoreAssetStorage = {
  /** Returns a URL for the provided asset ID */
  getAssetUrl: (assetId: string) => string
}

interface IStudioAssetStorage extends ICoreAssetStorage {
  /** Creates an asset from the provided blob and returns a promise to its ID */
  createAsset: (asset: File) => Promise<string | null>
}

export type IAssetStorageConfig = {
  /**
   * An object containing the core asset storage methods.
   */
  coreAssetStorage: ICoreAssetStorage
}

type IAssetConf = {
  /** The base URL for assets. */
  baseUrl?: string
}

export type Conf = Partial<{
  state: OnDiskState
  assets: IAssetConf
  experiments: ExperimentsConf
}>

export type ExperimentsConf = Partial<{}>

export default class Project {
  readonly pointers: {
    historic: Pointer<ProjectState['historic'] | undefined>
    ephemeral: Pointer<ProjectEphemeralState>
  }

  private readonly _pointerProxies: {
    historic: PointerProxy<ProjectState['historic']>
    ephemeral: PointerProxy<ProjectEphemeralState>
  }

  readonly address: ProjectAddress

  private readonly _studioReadyDeferred: Deferred<undefined>
  private readonly _assetStorageReadyDeferred: Deferred<undefined>
  private readonly _readyPromise: Promise<void>

  private _sheetTemplates = new Atom<{
    [sheetId: string]: SheetTemplate | undefined
  }>({})
  sheetTemplatesP = this._sheetTemplates.pointer
  private _studio: Studio | undefined
  assetStorage: IStudioAssetStorage

  type: 'Theatre_Project' = 'Theatre_Project'

  constructor(
    id: ProjectId,
    readonly config: Conf = {},
    readonly publicApi: TheatreProject,
  ) {
    this.address = {projectId: id}

    const onDiskEphemeralAtom = new Atom<ProjectEphemeralState>({
      loadingState: {
        type: 'loaded',
      },
      lastExportedObject: null,
    })

    const onDiskStateAtom = new Atom<ProjectState>({
      historic: config.state ?? {
        sheetsById: {},
        definitionVersion: globals.currentProjectStateDefinitionVersion,
        revisionHistory: [],
      },
    })

    this._assetStorageReadyDeferred = defer()
    this.assetStorage = {
      getAssetUrl: (assetId: string) => `${config.assets?.baseUrl}/${assetId}`,

      // Until the asset storage is ready, we'll throw an error when the user tries to use it
      createAsset: () => {
        throw new Error(`Please wait for Project.ready to use assets.`)
      },
    }

    this._pointerProxies = {
      historic: new PointerProxy(onDiskStateAtom.pointer.historic),
      ephemeral: new PointerProxy(onDiskEphemeralAtom.pointer),
    }

    this.pointers = {
      historic: this._pointerProxies.historic.pointer,
      ephemeral: this._pointerProxies.ephemeral.pointer,
    }

    projectsSingleton.add(id, this)

    this._studioReadyDeferred = defer()

    this._readyPromise = Promise.all([
      this._studioReadyDeferred.promise,
      this._assetStorageReadyDeferred.promise,
      // hide the array from the user, i.e. make it Promise<void> instead of Promise<[undefined, undefined]>
    ]).then(() => {})

    if (config.state) {
      setTimeout(() => {
        // The user has provided config.state but in case @theatre/studio is loaded,
        // let's give it one tick to attach itself
        if (!this._studio) {
          this._studioReadyDeferred.resolve(undefined)
          this._assetStorageReadyDeferred.resolve(undefined)
        }
      }, 0)
    } else {
      if (typeof window === 'undefined') {
        if (process.env.NODE_ENV === 'production') {
          console.error(
            `Argument config.state in Theatre.getProject("${id}", config) is empty. ` +
              `You can safely ignore this message if you're developing a Next.js/Remix project in development mode. But if you are shipping to your end-users, ` +
              `then you need to set config.state, ` +
              `otherwise your project's state will be empty and nothing will animate. Learn more at https://www.theatrejs.com/docs/latest/manual/projects#state`,
          )
        }
      } else {
        setTimeout(() => {
          if (!this._studio) {
            throw new Error(
              `Argument config.state in Theatre.getProject("${id}", config) is empty. This is fine ` +
                `while you are using @theatre/core along with @theatre/studio. But since @theatre/studio ` +
                `is not loaded, the state of project "${id}" will be empty.\n\n` +
                `To fix this, you need to add @theatre/studio into the bundle and export ` +
                `the project's state. Learn how to do that at https://www.theatrejs.com/docs/latest/manual/projects#state\n`,
            )
          }
        }, 1000)
      }
    }
  }

  attachToStudio(studio: Studio) {
    if (this._studio) {
      if (this._studio !== studio) {
        throw new Error(
          `Project ${this.address.projectId} is already attached to studio ${this._studio.address.studioId}`,
        )
      } else {
        console.warn(
          `Project ${this.address.projectId} is already attached to studio ${this._studio.address.studioId}`,
        )
        return
      }
    }
    this._studio = studio

    studio.initialized
      .then(async () => {
        await initialiseProjectState(studio, this, this.config.state)

        this._pointerProxies.historic.setPointer(
          studio.atomP.historic.coreByProject[
            this.address.projectId
          ] as $IntentionalAny,
        )

        this._pointerProxies.ephemeral.setPointer(
          studio.ephemeralAtom.pointer.coreByProject[this.address.projectId],
        )

        // asset storage has to be initialized after the pointers are set
        await studio
          .createAssetStorage(this, this.config.assets?.baseUrl)
          .then((assetStorage: $____FixmeStudio) => {
            this.assetStorage = assetStorage
            this._assetStorageReadyDeferred.resolve(undefined)
          })

        this._studioReadyDeferred.resolve(undefined)
      })
      .catch((err: $____FixmeStudio) => {
        console.error(err)
        throw err
      })
  }

  get isAttachedToStudio() {
    return !!this._studio
  }

  get ready() {
    return this._readyPromise
  }

  isReady() {
    return (
      this._studioReadyDeferred.status === 'resolved' &&
      this._assetStorageReadyDeferred.status === 'resolved'
    )
  }

  getOrCreateSheet(
    sheetId: SheetId,
    instanceId: SheetInstanceId = 'default' as SheetInstanceId,
  ): Sheet {
    let template = this._sheetTemplates.get()[sheetId]

    if (!template) {
      template = new SheetTemplate(this, sheetId)
      this._sheetTemplates.reduce((s) => ({...s, [sheetId]: template}))
    }

    return template.getInstance(instanceId)
  }
}

/**
 * Lightweight validator that only makes sure the state's definitionVersion is correct.
 * Does not do a thorough validation of the state.
 */
export const shallowValidateOnDiskState = (
  projectId: ProjectId,
  s: OnDiskState,
) => {
  if (
    Array.isArray(s) ||
    s == null ||
    s.definitionVersion !== globals.currentProjectStateDefinitionVersion
  ) {
    throw new InvalidArgumentError(
      `Error validating conf.state in Theatre.getProject(${JSON.stringify(
        projectId,
      )}, conf). The state seems to be formatted in a way that is unreadable to Theatre.js. Read more at https://www.theatrejs.com/docs/latest/manual/projects#state`,
    )
  }
}

export const deepValidateOnDiskState = (
  projectId: ProjectId,
  s: OnDiskState,
) => {
  shallowValidateOnDiskState(projectId, s)
  // @TODO do a deep validation here
}

export const validateProjectIdOrThrow = (value: string) => {
  if (typeof value !== 'string') {
    throw new InvalidArgumentError(
      `Argument 'projectId' in \`Theatre.getProject(projectId, ...)\` must be a string. Instead, it was ${userReadableTypeOfValue(
        value,
      )}.`,
    )
  }

  const idTrimmed = value.trim()
  if (idTrimmed.length !== value.length) {
    throw new InvalidArgumentError(
      `Argument 'projectId' in \`Theatre.getProject("${value}", ...)\` should not have surrounding whitespace.`,
    )
  }

  if (idTrimmed.length < 3) {
    throw new InvalidArgumentError(
      `Argument 'projectId' in \`Theatre.getProject("${value}", ...)\` should be at least 3 characters long.`,
    )
  }
}
