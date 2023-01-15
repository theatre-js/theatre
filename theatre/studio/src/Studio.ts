import Scrub from '@theatre/studio/Scrub'
import type {StudioHistoricState} from '@theatre/studio/store/types/historic'
import type UI from '@theatre/studio/UI'
import type {Pointer, Ticker} from '@theatre/dataverse'
import {Atom, PointerProxy, pointerToPrism} from '@theatre/dataverse'
import type {
  CommitOrDiscard,
  ITransactionPrivateApi,
} from './StudioStore/StudioStore'
import StudioStore from './StudioStore/StudioStore'
import type {IExtension, IStudio} from './TheatreStudio'
import TheatreStudio from './TheatreStudio'
import {nanoid} from 'nanoid/non-secure'
import type Project from '@theatre/core/projects/Project'
import type {CoreBits} from '@theatre/core/CoreBundle'
import SimpleCache from '@theatre/shared/utils/SimpleCache'
import type {IProject, ISheet} from '@theatre/core'
import PaneManager from './PaneManager'
import type * as _coreExports from '@theatre/core/coreExports'
import type {OnDiskState} from '@theatre/core/projects/store/storeTypes'
import type {Deferred} from '@theatre/shared/utils/defer'
import {defer} from '@theatre/shared/utils/defer'
import type {ProjectId} from '@theatre/shared/utils/ids'
import checkForUpdates from './checkForUpdates'
import shallowEqual from 'shallowequal'
import {createStore} from './IDBStorage'
import {getAllPossibleAssetIDs} from '@theatre/shared/utils/assets'
import {notify} from './notify'
import type {RafDriverPrivateAPI} from '@theatre/core/rafDrivers'

export type CoreExports = typeof _coreExports

const UIConstructorModule =
  typeof window !== 'undefined' ? require('./UI') : null

// this package has a reference to `window` that breaks SSR, so we require it conditionally
const blobCompare =
  typeof window !== 'undefined' ? require('blob-compare') : null

const STUDIO_NOT_INITIALIZED_MESSAGE = `You seem to have imported '@theatre/studio' but haven't initialized it. You can initialize the studio by:
\`\`\`
import studio from '@theatre/studio'
studio.initialize()
\`\`\`

* If you didn't mean to import '@theatre/studio', this means that your bundler is not tree-shaking it. This is most likely a bundler misconfiguration.

* If you meant to import '@theatre/studio' without showing its UI, you can do that by running:

\`\`\`
import studio from '@theatre/studio'
studio.initialize()
studio.ui.hide()
\`\`\`
`

const STUDIO_INITIALIZED_LATE_MSG = `You seem to have imported '@theatre/studio' but called \`studio.initialize()\` after some delay.
Theatre.js projects remain in pending mode (won't play their sequences) until the studio is initialized, so you should place the \`studio.initialize()\` line right after the import line:

\`\`\`
import studio from '@theatre/studio'
// ... and other imports

studio.initialize()
\`\`\`
`

export class Studio {
  readonly ui!: UI
  readonly publicApi: IStudio
  readonly address: {studioId: string}
  readonly _projectsProxy: PointerProxy<Record<ProjectId, Project>> =
    new PointerProxy(new Atom({}).pointer)

  readonly projectsP: Pointer<Record<ProjectId, Project>> =
    this._projectsProxy.pointer

  private readonly _store = new StudioStore()
  private _corePrivateApi: CoreBits['privateAPI'] | undefined

  private readonly _cache = new SimpleCache()
  readonly paneManager: PaneManager

  /**
   * An atom holding the exports of '\@theatre/core'. Will be undefined if '\@theatre/core' is never imported
   */
  private _coreAtom = new Atom<{core?: CoreExports}>({})

  /**
   * A Deferred that will resolve once studio is initialized (and its state is read from storage)
   */
  private readonly _initializedDeferred: Deferred<void> = defer()
  /**
   * Tracks whether studio.initialize() is called.
   */
  private _initializeFnCalled = false
  /**
   * Will be set to true if studio.initialize() isn't called after 100ms.
   */
  private _didWarnAboutNotInitializing = false

  /**
   * This will be set as soon as `@theatre/core` registers itself on `@theatre/studio`
   */
  private _coreBits: CoreBits | undefined

  get ticker(): Ticker {
    if (!this._rafDriver) {
      throw new Error(
        '`studio.ticker` was read before studio.initialize() was called.',
      )
    }
    return this._rafDriver.ticker
  }

  private _rafDriver: RafDriverPrivateAPI | undefined

  get atomP() {
    return this._store.atomP
  }

  constructor() {
    this.address = {studioId: nanoid(10)}
    this.publicApi = new TheatreStudio(this)

    // initialize UI if we're in the browser
    if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined') {
      this.ui = new UIConstructorModule.default(this)
    }

    this._attachToIncomingProjects()
    this.paneManager = new PaneManager(this)

    // check whether studio.initialize() is called, but only if we're in the browser
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (!this._initializeFnCalled) {
          console.error(STUDIO_NOT_INITIALIZED_MESSAGE)
          this._didWarnAboutNotInitializing = true
        }
      }, 100)
    }
  }

  async initialize(opts?: Parameters<IStudio['initialize']>[0]) {
    if (!this._coreBits) {
      throw new Error(
        `You seem to have imported \`@theatre/studio\` without importing \`@theatre/core\`. Make sure to include an import of \`@theatre/core\` before calling \`studio.initializer()\`.`,
      )
    }

    if (this._initializeFnCalled) {
      console.log(
        `\`studio.initialize()\` is already called. Ignoring subsequent calls.`,
      )
      return this._initializedDeferred.promise
    }
    this._initializeFnCalled = true

    if (this._didWarnAboutNotInitializing) {
      console.warn(STUDIO_INITIALIZED_LATE_MSG)
    }

    const storeOpts: Parameters<typeof this._store['initialize']>[0] = {
      persistenceKey: 'theatre-0.4',
      usePersistentStorage: true,
    }

    if (typeof opts?.persistenceKey === 'string') {
      storeOpts.persistenceKey = opts.persistenceKey
    }

    if (opts?.usePersistentStorage === false || typeof window === 'undefined') {
      storeOpts.usePersistentStorage = false
    }

    if (opts?.__experimental_rafDriver) {
      if (
        opts.__experimental_rafDriver.type !== 'Theatre_RafDriver_PublicAPI'
      ) {
        throw new Error(
          'parameter `rafDriver` in `studio.initialize({__experimental_rafDriver})` must be either be undefined, or the return type of core.createRafDriver()',
        )
      }

      const rafDriverPrivateApi = this._coreBits.privateAPI(
        opts.__experimental_rafDriver,
      )
      if (!rafDriverPrivateApi) {
        // TODO - need to educate the user about this edge case
        throw new Error(
          'parameter `rafDriver` in `studio.initialize({__experimental_rafDriver})` seems to come from a different version of `@theatre/core` than the version that is attached to `@theatre/studio`',
        )
      }
      this._rafDriver = rafDriverPrivateApi
    } else {
      this._rafDriver = this._coreBits.getCoreRafDriver()
    }

    try {
      await this._store.initialize(storeOpts)
    } catch (e) {
      this._initializedDeferred.reject(e)
      return
    }

    this._initializedDeferred.resolve()

    if (process.env.NODE_ENV !== 'test' && this.ui) {
      this.ui.render()
      checkForUpdates()
    }
  }

  get initialized(): Promise<void> {
    return this._initializedDeferred.promise
  }

  _attachToIncomingProjects() {
    const projectsD = pointerToPrism(this.projectsP)

    const attachToProjects = (projects: Record<string, Project>) => {
      for (const project of Object.values(projects)) {
        if (!project.isAttachedToStudio) {
          project.attachToStudio(this)
        }
      }
    }
    projectsD.onStale(() => {
      attachToProjects(projectsD.getValue())
    })
    attachToProjects(projectsD.getValue())
  }

  setCoreBits(coreBits: CoreBits) {
    this._coreBits = coreBits
    this._corePrivateApi = coreBits.privateAPI
    this._coreAtom.setByPointer((p) => p.core, coreBits.coreExports)
    this._setProjectsP(coreBits.projectsP)
  }

  private _setProjectsP(projectsP: Pointer<Record<ProjectId, Project>>) {
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

  get core() {
    return this._coreAtom.get().core
  }

  get coreP() {
    return this._coreAtom.pointer.core
  }

  extend(extension: IExtension) {
    if (!extension || typeof extension !== 'object') {
      throw new Error(`Extensions must be JS objects`)
    }

    if (typeof extension.id !== 'string') {
      throw new Error(`extension.id must be a string`)
    }

    this.transaction(({drafts}) => {
      if (drafts.ephemeral.extensions.byId[extension.id]) {
        const prevExtension = drafts.ephemeral.extensions.byId[extension.id]
        if (
          extension === prevExtension ||
          shallowEqual(extension, prevExtension)
        ) {
          // probably running studio.extend() several times because of hot reload.
          // as long as it's the same extension, we can safely ignore.
          return
        }
        throw new Error(`Extension id "${extension.id}" is already defined`)
      }

      drafts.ephemeral.extensions.byId[extension.id] = extension

      const allPaneClasses = drafts.ephemeral.extensions.paneClasses

      extension.panes?.forEach((classDefinition) => {
        if (typeof classDefinition.class !== 'string') {
          throw new Error(`pane.class must be a string`)
        }

        if (classDefinition.class.length < 3) {
          throw new Error(
            `pane.class should be a string with 3 or more characters`,
          )
        }

        const existing = allPaneClasses[classDefinition.class]
        if (existing) {
          throw new Error(
            `Pane class "${classDefinition.class}" already exists and is supplied by extension ${existing}`,
          )
        }

        allPaneClasses[classDefinition.class] = {
          extensionId: extension.id,
          classDefinition: classDefinition,
        }
      })
    })
  }

  getStudioProject(core: CoreExports): IProject {
    return this._cache.get('getStudioProject', () => core.getProject('Studio'))
  }

  getExtensionSheet(extensionId: string, core: CoreExports): ISheet {
    return this._cache.get('extensionSheet-' + extensionId, () =>
      this.getStudioProject(core)!.sheet('Extension ' + extensionId),
    )
  }

  undo() {
    this._store.undo()
  }

  redo() {
    this._store.redo()
  }

  createContentOfSaveFile(projectId: string): OnDiskState {
    return this._store.createContentOfSaveFile(projectId as ProjectId)
  }

  /** A function that returns a promise to an object containing asset storage methods for a project to be used by studio. */
  async createAssetStorage(project: Project, baseUrl?: string) {
    // in SSR we bail out and return a dummy asset manager
    if (typeof window === 'undefined') {
      return {
        getAssetUrl: () => '',
        createAsset: () => Promise.resolve(null),
      }
    }

    // Check for support.
    if (!('indexedDB' in window)) {
      if (process.env.NODE_ENV !== 'test')
        console.log("This browser doesn't support IndexedDB.")

      return {
        getAssetUrl: (assetId: string) => {
          throw new Error(
            `IndexedDB is required by the default asset manager, but it's not supported by this browser. To use assets, please provide your own asset manager to the project config.`,
          )
        },
        createAsset: (asset: Blob) => {
          throw new Error(
            `IndexedDB is required by the default asset manager, but it's not supported by this browser. To use assets, please provide your own asset manager to the project config.`,
          )
        },
      }
    }

    const idb = createStore(`${project.address.projectId}-assets`)

    // get all possible asset ids referenced by either static props or keyframes
    const possibleAssetIDs = getAllPossibleAssetIDs(project)

    // Clean up assets not referenced by the project. We can only do this at the start because otherwise
    // we'd break undo/redo.
    const idbKeys = await idb.keys<string>()
    await Promise.all(
      idbKeys.map(async (key) => {
        if (!possibleAssetIDs.includes(key)) {
          await idb.del(key)
        }
      }),
    )

    // Clean up idb entries exported to disk
    await Promise.all(
      idbKeys.map(async (key) => {
        const assetUrl = `${baseUrl}/${key}`

        try {
          const response = await fetch(assetUrl, {method: 'HEAD'})
          if (response.ok) {
            await idb.del(key)
          }
        } catch (e) {
          notify.error(
            'Failed to access assets',
            `Failed to access assets at ${
              project.config.assets?.baseUrl ?? '/'
            }. This is likely due to a CORS issue.`,
          )
        }
      }),
    )

    // A map for caching the assets outside of the db. We also need this to be able to retrieve idb asset urls synchronously.
    const assetsMap = new Map(await idb.entries<string, Blob>())

    // A map for caching the object urls created from idb assets.
    const urlCache = new Map<Blob, string>()

    /** Gets idb aset url from asset blob */
    const getUrlForAsset = (asset: Blob) => {
      if (urlCache.has(asset)) {
        return urlCache.get(asset)!
      } else {
        const url = URL.createObjectURL(asset)
        urlCache.set(asset, url)
        return url
      }
    }

    /** Gets idb asset url from id */
    const getUrlForId = (assetId: string) => {
      const asset = assetsMap.get(assetId)
      if (!asset) {
        throw new Error(`Asset with id ${assetId} not found`)
      }
      return getUrlForAsset(asset)
    }

    return {
      getAssetUrl: (assetId: string) => {
        return assetsMap.has(assetId)
          ? getUrlForId(assetId)
          : `${baseUrl}/${assetId}`
      },
      createAsset: async (asset: File) => {
        const existingIDs = getAllPossibleAssetIDs(project)

        let sameSame = false

        if (existingIDs.includes(asset.name)) {
          let existingAsset: Blob | undefined
          try {
            existingAsset =
              assetsMap.get(asset.name) ??
              (await fetch(`${baseUrl}/${asset.name}`).then((r) =>
                r.ok ? r.blob() : undefined,
              ))
          } catch (e) {
            notify.error(
              'Failed to access assets',
              `Failed to access assets at ${
                project.config.assets?.baseUrl ?? '/'
              }. This is likely due to a CORS issue.`,
            )

            return Promise.resolve(null)
          }

          if (existingAsset) {
            // @ts-ignore
            sameSame = await blobCompare!.isEqual(asset, existingAsset)

            // if same same, we do nothing
            if (sameSame) {
              return asset.name
              // if different, we ask the user to pls rename
            } else {
              /** Initiates rename using a dialog. Returns a boolean indicating if the rename was succesful. */
              const renameAsset = (text: string): boolean => {
                const newAssetName = prompt(text, asset.name)

                if (newAssetName === null) {
                  // asset creation canceled
                  return false
                } else if (newAssetName === '') {
                  return renameAsset(
                    'Asset name cannot be empty. Please choose a different file name for this asset.',
                  )
                } else if (existingIDs.includes(newAssetName)) {
                  console.log(existingIDs)
                  return renameAsset(
                    'An asset with this name already exists. Please choose a different file name for this asset.',
                  )
                }

                // rename asset
                asset = new File([asset], newAssetName, {type: asset.type})
                return true
              }

              // rename asset returns false if the user cancels the rename
              const success = renameAsset(
                'An asset with this name already exists. Please choose a different file name for this asset.',
              )

              if (!success) {
                return null
              }
            }
          }
        }

        assetsMap.set(asset.name, asset)
        await idb.set(asset.name, asset)
        return asset.name
      },
    }
  }
}
