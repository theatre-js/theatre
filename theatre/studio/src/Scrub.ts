import forEachDeep from '@theatre/shared/utils/forEachDeep'
import type {$FixMe} from '@theatre/shared/utils/types'
import type {Pointer} from '@theatre/dataverse'
import {getPointerParts} from '@theatre/dataverse'
import type Studio from './Studio'
import type {CommitOrDiscard} from './StudioStore/StudioStore'
import logger from '@theatre/shared/logger'
import {isSheetObject} from '@theatre/shared/instanceTypes'

type State_Captured = {
  type: 'Captured'
  transaction: CommitOrDiscard
  flagsTransaction: CommitOrDiscard
}

type State =
  | {
      type: 'Ready'
    }
  | State_Captured
  | {type: 'Committed'}
  | {type: 'Discarded'}

let lastScrubIdAsNumber = 0

export interface IScrubApi {
  set<T>(pointer: Pointer<T>, value: T): void
}

export interface IScrub {
  reset(): void
  commit(): void
  capture(fn: (api: IScrubApi) => void): void
  discard(): void
}

export default class Scrub implements IScrub {
  private readonly _id: string
  private _state: State = {type: 'Ready'}
  // private readonly _scrubApi: IScrubApi

  get status() {
    return this._state.type
  }

  constructor(private readonly _studio: Studio) {
    this._id = String(lastScrubIdAsNumber++)
  }

  reset(): void {
    const {_state: state} = this

    if (state.type === 'Ready') {
      return
    } else if (state.type === 'Captured') {
      this._state = {type: 'Ready'}
      state.transaction.discard()
      state.flagsTransaction.discard()
    } else if (state.type === 'Committed') {
      throw new Error(`This scrub is already committed and can't be reset.`)
    } else {
      throw new Error(`This scrub is already discarded and can't be reset.`)
    }
  }

  commit(): void {
    const {_state: state} = this

    if (state.type === 'Captured') {
      state.transaction.commit()
      state.flagsTransaction.discard()
      this._state = {type: 'Committed'}
    } else if (state.type === 'Ready') {
      logger.warn(`Scrub is empty. Nothing to commit.`)
      return
    } else if (state.type === 'Committed') {
      throw new Error(`This scrub is already committed.`)
    } else {
      throw new Error(`This scrub is already discarded and can't be comitted.`)
    }
  }

  capture(fn: (api: IScrubApi) => void): void {
    if (this._state.type === 'Captured') {
      this.reset()
    }

    if (this._state.type === 'Ready') {
      let errored = true
      try {
        this._state = {type: 'Captured', ...this._capture(fn)}
        errored = false
      } finally {
        if (errored) {
          this._state = {type: 'Discarded'}
        }
      }
    } else {
      if (this._state.type === 'Committed') {
        throw new Error(
          `This scrub is already committed and cannot capture again.` +
            `If you wish to capture more, you can start a new studio.scrub() or do so before scrub.commit()`,
        )
      } else {
        throw new Error(
          `This scrub is already discarded and cannot capture again.` +
            `If you wish to capture more, you can start a new studio.scrub() or do so before scrub.discard()`,
        )
      }
    }
  }

  private _capture(fn: (api: IScrubApi) => void): {
    transaction: CommitOrDiscard
    flagsTransaction: CommitOrDiscard
  } {
    const sets: Array<Pointer<$FixMe>> = []
    const transaction = this._studio.tempTransaction((transactionApi) => {
      let running = true

      const api: IScrubApi = {
        set: (pointer, value) => {
          if (!running) {
            throw new Error(
              `You seem to have called the scrub api after scrub.capture()`,
            )
          }

          const {root, path} = getPointerParts(pointer as Pointer<$FixMe>)

          if (!isSheetObject(root)) {
            throw new Error(`We can only scrub props of Sheet Objects for now`)
          }

          transactionApi.set(pointer, value)
          sets.push(pointer as Pointer<$FixMe>)
        },
      }

      try {
        fn(api)
      } finally {
        running = false
      }
    })

    const flagsTransaction = this._studio.tempTransaction(({stateEditors}) => {
      sets.forEach((pointer) => {
        const {root, path} = getPointerParts(pointer as Pointer<$FixMe>)
        if (!isSheetObject(root)) {
          return
        }

        const defaultValueOfProp = root.template.getDefaultsAtPointer(pointer)

        forEachDeep(
          defaultValueOfProp,
          (val, pathToProp) => {
            stateEditors.studio.ephemeral.projects.stateByProjectId.stateBySheetId.stateByObjectKey.propsBeingScrubbed.flag(
              {...root.address, pathToProp},
            )
          },
          path,
        )
      })
    })

    return {transaction, flagsTransaction}
  }

  discard(): void {
    const {_state: state} = this

    if (state.type === 'Captured' || state.type === 'Ready') {
      if (state.type === 'Captured') {
        state.transaction.discard()
        state.flagsTransaction.discard()
      }
      this._state = {type: 'Discarded'}
    } else if (state.type === 'Committed') {
      throw new Error(`This scrub is already committed and can't be discarded.`)
    } else {
      throw new Error(`This scrub is already discarded`)
    }
  }
}
