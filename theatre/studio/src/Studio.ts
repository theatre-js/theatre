import Scrub from '@theatre/studio/Scrub'
import type {StudioHistoricState} from '@theatre/studio/store/types/historic'
import type UI from '@theatre/studio/UI'
import type {Pointer} from '@theatre/dataverse'
import {Atom, PointerProxy, valueDerivation} from '@theatre/dataverse'
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

export type CoreExports = typeof _coreExports

const UIConstructorModule =
  typeof window !== 'undefined' ? require('./UI') : null

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

  get atomP() {
    return this._store.atomP
  }

  constructor() {
    this.address = {studioId: nanoid(10)}
    this.publicApi = new TheatreStudio(this)

    if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined') {
      this.ui = new UIConstructorModule.default(this)
    }

    this._attachToIncomingProjects()
    this.paneManager = new PaneManager(this)

    setTimeout(() => {
      if (!this._initializeFnCalled) {
        console.error(STUDIO_NOT_INITIALIZED_MESSAGE)
        this._didWarnAboutNotInitializing = true
      }
    }, 100)
  }

  async initialize(opts?: Parameters<IStudio['initialize']>[0]) {
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
    this._coreAtom.setIn(['core'], coreBits.coreExports)
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
    return this._coreAtom.getState().core
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
}
