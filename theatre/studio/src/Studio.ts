import Scrub from '@theatre/studio/Scrub'
import type {StudioHistoricState} from '@theatre/studio/store/types/historic'
import UI from '@theatre/studio/UI'
import type {Pointer} from '@theatre/dataverse'
import {val, Atom, PointerProxy, valueDerivation} from '@theatre/dataverse'
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
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {CopiedKeyframes} from './store/types'

export type CoreExports = typeof _coreExports

export class Studio {
  readonly ui!: UI
  readonly publicApi: IStudio
  readonly address: {studioId: string}
  readonly _projectsProxy: PointerProxy<Record<string, Project>> =
    new PointerProxy(new Atom({}).pointer)

  readonly projectsP: Pointer<Record<string, Project>> =
    this._projectsProxy.pointer

  private readonly _store = new StudioStore()
  private _corePrivateApi: CoreBits['privateAPI'] | undefined

  private readonly _cache = new SimpleCache()
  readonly paneManager: PaneManager

  private _coreAtom = new Atom<{core?: CoreExports}>({})
  private readonly _initializedDeferred: Deferred<void> = defer()
  private _initializeFnCalled = false

  get atomP() {
    return this._store.atomP
  }

  constructor() {
    this.address = {studioId: nanoid(10)}
    this.publicApi = new TheatreStudio(this)

    if (process.env.NODE_ENV !== 'test') {
      this.ui = new UI(this)
    }

    this._attachToIncomingProjects()
    this.paneManager = new PaneManager(this)

    /**
     * @remarks
     * TODO If studio.initialize() is not called within a few milliseconds,
     * we should console.warn() the user that `@theatre/studio` is still in
     * their bundle. This way we can avoid issues like
     * [this](https://discord.com/channels/870988717190426644/892469755225710642/892479678797971486).
     */
  }

  async initialize(opts?: Parameters<IStudio['initialize']>[0]) {
    if (this._initializeFnCalled) {
      return this._initializedDeferred.promise
    }
    const storeOpts: Parameters<typeof this._store['initialize']>[0] = {
      persistenceKey: 'theatre-0.4',
      usePersistentStorage: true,
    }

    if (typeof opts?.persistenceKey === 'string') {
      storeOpts.persistenceKey = opts.persistenceKey
    }

    if (opts?.usePersistentStorage === false) {
      storeOpts.usePersistentStorage = false
    }

    try {
      await this._store.initialize(storeOpts)
    } catch (e) {
      this._initializedDeferred.reject(e)
      return
    }

    this._initializedDeferred.resolve()

    if (process.env.NODE_ENV !== 'test') {
      this.ui.render()
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

  pasteKeyframes({
    sheetObject,
    trackId: selectedTrackId,
    keyframes: keyframesToPaste,
  }: {
    sheetObject: SheetObject
    trackId: string
    keyframes: CopiedKeyframes[]
  }) {
    const {address, sheet} = sheetObject
    const allTracks = val(sheetObject.template.getArrayOfValidSequenceTracks())
    const selectedTrackIndex = allTracks.findIndex(
      ({trackId}) => trackId === selectedTrackId,
    )

    const sequence = sheetObject.sheet.getSequence()
    const position = sequence.positionDerivation.getValue()

    /**
     * In order to paste keyframes back into their original place, keyframesToPaste will include
     * all tracks (even those without any copied keyframes), in their current order.
     *
     * To determine if we are pasting back to the same track or a different track, we need to find
     * the first track that contains any keyframes and see if it is equal to the selectedTrackId
     */

    const firstTrackContainingKeyframesIndex = keyframesToPaste.findIndex(
      ({keyframes}) => keyframes.length,
    )
    let offsetPosition: number | undefined = undefined

    // Paste back to same tracks
    if (selectedTrackIndex === firstTrackContainingKeyframesIndex) {
      const tracksToPaste = keyframesToPaste.map(({trackId, keyframes}) => {
        const keyframesWithNewPositions: Keyframe[] = []

        for (let i = 0; i < keyframes.length; i++) {
          const kf = keyframes[i]
          if (offsetPosition === undefined) {
            offsetPosition = kf.position
            keyframesWithNewPositions.push({...kf, position})
          } else {
            // Offset the position from the first keyframe
            const newPosition = kf.position + position - offsetPosition
            keyframesWithNewPositions.push({...kf, position: newPosition})
          }
        }

        return {
          ...address,
          trackId,
          keyframes: keyframesWithNewPositions,
          snappingFunction: sheet.getSequence().closestGridPosition,
        }
      })

      this.transaction((api) => {
        tracksToPaste.forEach((track) => {
          api.stateEditors.coreByProject.historic.sheetsById.sequence.mergeKeyframes(
            track,
          )
        })
      })
    } else {
      // Paste to different tracks

      // Remove any empty tracks from the start
      const trimmedKeyframesToPaste = keyframesToPaste.slice(
        firstTrackContainingKeyframesIndex,
      )

      const tracksToPaste = allTracks.map(({trackId}, i) => {
        const keyframesWithNewPositions: Keyframe[] = []

        const track = trimmedKeyframesToPaste.shift()
        if (i >= selectedTrackIndex && track) {
          for (let i = 0; i < track.keyframes.length; i++) {
            const kf = track.keyframes[i]
            if (offsetPosition === undefined) {
              offsetPosition = kf.position
              keyframesWithNewPositions.push({...kf, position})
            } else {
              // Offset the position from the first keyframe
              const newPosition = kf.position + position - offsetPosition
              keyframesWithNewPositions.push({...kf, position: newPosition})
            }
          }
        }

        return {
          ...address,
          trackId,
          keyframes: keyframesWithNewPositions,
          snappingFunction: sheet.getSequence().closestGridPosition,
        }
      })

      this.transaction((api) => {
        tracksToPaste.forEach((track) => {
          api.stateEditors.coreByProject.historic.sheetsById.sequence.mergeKeyframes(
            track,
          )
        })
      })
    }
  }

  createContentOfSaveFile(projectId: string): OnDiskState {
    return this._store.createContentOfSaveFile(projectId)
  }
}
