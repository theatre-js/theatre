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
import {defer} from '@theatre/shared/utils/defer'
import forEachDeep from '@theatre/shared/utils/forEachDeep'
import getDeep from '@theatre/shared/utils/getDeep'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import atomFromReduxStore from '@theatre/shared/utils/redux/atomFromReduxStore'
import configureStore from '@theatre/shared/utils/redux/configureStore'
import type {$FixMe, $IntentionalAny, VoidFn} from '@theatre/shared/utils/types'
import type {Atom, Pointer} from '@theatre/dataverse'
import {getPointerParts, val} from '@theatre/dataverse'
import type {Draft} from 'immer'
import {createDraft, finishDraft} from 'immer'
import get from 'lodash-es/get'
import type {Store} from 'redux'
import {persistStateOfStudio} from './persistStateOfStudio'
import {isSheetObject} from '@theatre/shared/instanceTypes'

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
  readonly initialized: Promise<void>

  constructor() {
    this._reduxStore = configureStore({
      rootReducer: studioReducer,
      devtoolsOptions: {name: 'Theatre.js Studio'},
    })
    this._atom = atomFromReduxStore(this._reduxStore)
    this.atomP = this._atom.pointer

    if ($env.disableStatePersistence !== true) {
      const d = defer<void>()
      this.initialized = d.promise
      persistStateOfStudio(this._reduxStore, () => {
        this.tempTransaction(({drafts}) => {
          drafts.ephemeral.initialised = true
        }).commit()
        d.resolve()
      })
    } else {
      this.tempTransaction(({drafts}) => {
        drafts.ephemeral.initialised = true
      }).commit()

      this.initialized = Promise.resolve()
    }
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
            const {root} = getPointerParts(pointer as Pointer<$FixMe>)
            if (isSheetObject(root)) {
              root.validateValue(pointer as Pointer<$FixMe>, value)

              const sequenceTracksTree = val(
                root.template
                  .getMapOfValidSequenceTracks_forStudio()
                  .getValue(),
              )

              forEachDeep(
                value,
                (v, pathToProp) => {
                  if (typeof v === 'undefined' || v === null) {
                    return
                  }
                  const propAddress = {...root.address, pathToProp}

                  const trackId = get(
                    sequenceTracksTree,
                    pathToProp,
                  ) as $FixMe as SequenceTrackId | undefined

                  if (typeof trackId === 'string') {
                    stateEditors.coreByProject.historic.sheetsById.sequence.setKeyframeAtPosition(
                      {
                        ...propAddress,
                        trackId,
                        position: root.sheet.getSequence().position,
                        value: v as $FixMe,
                      },
                    )
                  } else {
                    stateEditors.coreByProject.historic.sheetsById.staticOverrides.byObject.setValueOfPrimitiveProp(
                      {...propAddress, value: v},
                    )
                  }
                },
                getPointerParts(pointer as Pointer<$IntentionalAny>).path,
              )
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

              forEachDeep(
                defaultValue,
                (v, pathToProp) => {
                  const propAddress = {...root.address, pathToProp}

                  const trackId = get(
                    sequenceTracksTree,
                    pathToProp,
                  ) as $FixMe as SequenceTrackId | undefined

                  if (typeof trackId === 'string') {
                    stateEditors.coreByProject.historic.sheetsById.sequence.unsetKeyframeAtPosition(
                      {
                        ...propAddress,
                        trackId,
                        position: root.sheet.getSequence().position,
                      },
                    )
                  } else {
                    stateEditors.coreByProject.historic.sheetsById.staticOverrides.byObject.unsetValueOfPrimitiveProp(
                      propAddress,
                    )
                  }
                },
                getPointerParts(pointer as Pointer<$IntentionalAny>).path,
              )
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
}
