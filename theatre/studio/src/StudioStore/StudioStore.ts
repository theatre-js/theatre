import type {FullStudioState} from '@theatre/studio/store'
import {
  studioActions,
  studioReducer,
  tempActionGroup,
} from '@theatre/studio/store'
import type {IStateEditors} from '@theatre/studio/store/stateEditors'
import {setDrafts__onlyMeantToBeCalledByTransaction} from '@theatre/studio/store/stateEditors'
import type {
  StudioAhistoricState,
  StudioEphemeralState,
  StudioHistoricState,
} from '@theatre/studio/store/types'
import type {Deferred} from '@theatre/shared/utils/defer'
import {defer} from '@theatre/shared/utils/defer'
import forEachDeep from '@theatre/shared/utils/forEachDeep'
import getDeep from '@theatre/shared/utils/getDeep'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import atomFromReduxStore from '@theatre/studio/utils/redux/atomFromReduxStore'
import configureStore from '@theatre/studio/utils/redux/configureStore'
import type {$FixMe, $IntentionalAny, VoidFn} from '@theatre/shared/utils/types'
import type {Atom, Pointer} from '@theatre/dataverse'
import {getPointerParts, val} from '@theatre/dataverse'
import type {Draft} from 'immer'
import {createDraft, finishDraft} from 'immer'
import get from 'lodash-es/get'
import type {Store} from 'redux'
import {persistStateOfStudio} from './persistStateOfStudio'
import {isSheetObject} from '@theatre/shared/instanceTypes'
import type {OnDiskState} from '@theatre/core/projects/store/storeTypes'
import {generateDiskStateRevision} from './generateDiskStateRevision'
import type {PropTypeConfig} from '@theatre/core/propTypes'
import type {PathToProp} from '@theatre/shared/src/utils/addresses'
import {getPropConfigByPath} from '@theatre/shared/propTypes/utils'
import {cloneDeep} from 'lodash-es'

export type Drafts = {
  historic: Draft<StudioHistoricState>
  ahistoric: Draft<StudioAhistoricState>
  ephemeral: Draft<StudioEphemeralState>
}

export interface ITransactionPrivateApi {
  set<T>(pointer: Pointer<T>, value: T): void
  unset<T>(pointer: Pointer<T>): void
  drafts: Drafts
  stateEditors: IStateEditors
}

export type CommitOrDiscard = {
  commit: VoidFn
  discard: VoidFn
}

export default class StudioStore {
  private readonly _reduxStore: Store<FullStudioState>
  private readonly _atom: Atom<FullStudioState>
  readonly atomP: Pointer<FullStudioState>

  constructor() {
    this._reduxStore = configureStore({
      rootReducer: studioReducer,
      devtoolsOptions: {name: 'Theatre.js Studio'},
    })
    this._atom = atomFromReduxStore(this._reduxStore)
    this.atomP = this._atom.pointer
  }

  initialize(opts: {
    persistenceKey: string
    usePersistentStorage: boolean
  }): Promise<void> {
    const d: Deferred<void> = defer<void>()
    if (opts.usePersistentStorage === true) {
      persistStateOfStudio(
        this._reduxStore,
        () => {
          this.tempTransaction(({drafts}) => {
            drafts.ephemeral.initialised = true
          }).commit()
          d.resolve()
        },
        opts.persistenceKey,
      )
    } else {
      this.tempTransaction(({drafts}) => {
        drafts.ephemeral.initialised = true
      }).commit()

      d.resolve()
    }
    return d.promise
  }

  getState(): FullStudioState {
    return this._reduxStore.getState()
  }

  /**
   * This method causes the store to start the history from scratch. This is useful
   * for testing and development where you want to explicitly provide a state to the
   * store.
   */
  __dev_startHistoryFromScratch(newHistoricPart: StudioHistoricState) {
    this._reduxStore.dispatch(
      studioActions.historic.startHistoryFromScratch(
        studioActions.reduceParts((s) => ({...s, historic: newHistoricPart})),
      ),
    )
  }

  tempTransaction(fn: (api: ITransactionPrivateApi) => void): CommitOrDiscard {
    const group = tempActionGroup()
    let errorDuringTransaction: unknown

    const action = group.push(
      studioActions.reduceParts((wholeState) => {
        const drafts = {
          historic: createDraft(wholeState.historic),
          ahistoric: createDraft(wholeState.ahistoric),
          ephemeral: createDraft(wholeState.ephemeral),
        }

        let running = true

        let ensureRunning = () => {
          if (!running) {
            throw new Error(
              `You seem to have called the transaction api after studio.transaction() has finished running`,
            )
          }
        }

        const api: ITransactionPrivateApi = {
          set: (pointer, value) => {
            ensureRunning()
            const _value = cloneDeep(value)
            const {root, path} = getPointerParts(pointer as Pointer<$FixMe>)
            if (isSheetObject(root)) {
              root.validateValue(pointer as Pointer<$FixMe>, _value)

              const sequenceTracksTree = val(
                root.template
                  .getMapOfValidSequenceTracks_forStudio()
                  .getValue(),
              )

              const propConfig = getPropConfigByPath(
                root.template.config,
                path,
              ) as PropTypeConfig

              const setStaticOrKeyframeProp = <T>(
                value: T,
                path: PathToProp,
              ) => {
                if (typeof value === 'undefined' || value === null) {
                  return
                }

                const propAddress = {...root.address, pathToProp: path}

                const trackId = get(sequenceTracksTree, path) as $FixMe as
                  | SequenceTrackId
                  | undefined
                if (typeof trackId === 'string') {
                  const propConfig = getPropConfigByPath(
                    root.template.config,
                    path,
                  ) as PropTypeConfig | undefined
                  // TODO: Make sure this causes no problems wrt decorated
                  // or otherwise unserializable stuff that sanitize might return.
                  // value needs to be serializable.
                  if (propConfig?.sanitize) value = propConfig.sanitize(value)

                  const seq = root.sheet.getSequence()
                  seq.position = seq.closestGridPosition(seq.position)
                  stateEditors.coreByProject.historic.sheetsById.sequence.setKeyframeAtPosition(
                    {
                      ...propAddress,
                      trackId,
                      position: seq.position,
                      value: value as $FixMe,
                      snappingFunction: seq.closestGridPosition,
                    },
                  )
                } else if (propConfig !== undefined) {
                  stateEditors.coreByProject.historic.sheetsById.staticOverrides.byObject.setValueOfPrimitiveProp(
                    {...propAddress, value: value as $FixMe},
                  )
                }
              }

              // If we are dealing with a compound prop, we recurse through its
              // nested properties. The root prop with path.length === 0 is
              // implicitly considered a compound prop.
              if (path.length === 0 || propConfig?.type === 'compound') {
                forEachDeep(
                  _value,
                  (v, pathToProp) => {
                    setStaticOrKeyframeProp(v, pathToProp)
                  },
                  getPointerParts(pointer as Pointer<$IntentionalAny>).path,
                )
              } else {
                setStaticOrKeyframeProp(_value, path)
              }
            } else {
              throw new Error(
                'Only setting props of SheetObject-s is supported in a transaction so far',
              )
            }
          },
          unset: (pointer) => {
            ensureRunning()
            const {root, path} = getPointerParts(pointer as Pointer<$FixMe>)
            if (isSheetObject(root)) {
              const sequenceTracksTree = val(
                root.template
                  .getMapOfValidSequenceTracks_forStudio()
                  .getValue(),
              )

              const defaultValue = getDeep(
                root.template.getDefaultValues().getValue(),
                path,
              )

              const propConfig = getPropConfigByPath(
                root.template.config,
                path,
              ) as PropTypeConfig

              const unsetStaticOrKeyframeProp = <T>(
                value: T,
                path: PathToProp,
              ) => {
                const propAddress = {...root.address, pathToProp: path}

                const trackId = get(sequenceTracksTree, path) as $FixMe as
                  | SequenceTrackId
                  | undefined

                if (typeof trackId === 'string') {
                  stateEditors.coreByProject.historic.sheetsById.sequence.unsetKeyframeAtPosition(
                    {
                      ...propAddress,
                      trackId,
                      position: root.sheet.getSequence().positionSnappedToGrid,
                    },
                  )
                } else if (propConfig !== undefined) {
                  stateEditors.coreByProject.historic.sheetsById.staticOverrides.byObject.unsetValueOfPrimitiveProp(
                    propAddress,
                  )
                }
              }

              if (path.length === 0 || propConfig?.type === 'compound') {
                forEachDeep(
                  defaultValue,
                  (v, pathToProp) => {
                    unsetStaticOrKeyframeProp(v, pathToProp)
                  },
                  getPointerParts(pointer as Pointer<$IntentionalAny>).path,
                )
              } else {
                unsetStaticOrKeyframeProp(defaultValue, path)
              }
            } else {
              throw new Error(
                'Only setting props of SheetObject-s is supported in a transaction so far',
              )
            }
          },
          get drafts() {
            ensureRunning()
            return drafts
          },
          get stateEditors() {
            return stateEditors
          },
        }

        const stateEditors = setDrafts__onlyMeantToBeCalledByTransaction(drafts)

        try {
          fn(api)
          running = false
          return {
            historic: finishDraft(drafts.historic),
            ahistoric: finishDraft(drafts.ahistoric),
            ephemeral: finishDraft(drafts.ephemeral),
          }
        } catch (err: unknown) {
          errorDuringTransaction = err
          return wholeState
        } finally {
          setDrafts__onlyMeantToBeCalledByTransaction(undefined)
        }
      }),
    )

    this._reduxStore.dispatch(action)

    if (errorDuringTransaction) {
      this._reduxStore.dispatch(group.discard())
      throw errorDuringTransaction
    }

    return {
      commit: () => {
        this._reduxStore.dispatch(group.commit())
      },
      discard: () => {
        this._reduxStore.dispatch(group.discard())
      },
    }
  }

  undo() {
    this._reduxStore.dispatch(studioActions.historic.undo())
  }

  redo() {
    this._reduxStore.dispatch(studioActions.historic.redo())
  }

  createContentOfSaveFile(projectId: string): OnDiskState {
    const projectState =
      this._reduxStore.getState().$persistent.historic.innerState.coreByProject[
        projectId
      ]

    if (!projectState) {
      throw new Error(`Project ${projectId} has not been initialized.`)
    }

    const revision = generateDiskStateRevision()

    this.tempTransaction(({stateEditors}) => {
      stateEditors.coreByProject.historic.revisionHistory.add({
        projectId,
        revision,
      })
    }).commit()

    const projectHistoricState =
      this._reduxStore.getState().$persistent.historic.innerState.coreByProject[
        projectId
      ]

    const generatedOnDiskState: OnDiskState = {
      ...projectHistoricState,
    }

    return generatedOnDiskState
  }
}
