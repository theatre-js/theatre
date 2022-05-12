import forEachDeep from '@theatre/shared/utils/forEachDeep'
import type {$FixMe} from '@theatre/shared/utils/types'
import type {Pointer} from '@theatre/dataverse'
import {getPointerParts} from '@theatre/dataverse'
import type {Studio} from './Studio'
import type {CommitOrDiscard} from './StudioStore/StudioStore'
import logger from '@theatre/shared/logger'
import {isSheetObject} from '@theatre/shared/instanceTypes'

type State_Captured = {
  type: 'Captured'
  transaction: CommitOrDiscard
  flagsTransaction: CommitOrDiscard
}

type State =
  | {type: 'Ready'}
  | State_Captured
  | {type: 'Committed'}
  | {type: 'Discarded'}

let lastScrubIdAsNumber = 0

/**
 * The scrub API is a simple construct for changing values in Theatre in a history-compatible way.
 * Primarily, it can be used to create a series of value changes using a temp transaction without
 * creating multiple transactions.
 *
 * The name is inspired by the activity of "scrubbing" the value of an input through clicking and
 * dragging left and right. But, the API is not limited to chaning a single prop's value.
 *
 * For now, using the {@link IScrubApi.set} will result in changing the values where the
 * playhead is (the `sequence.position`).
 */
export interface IScrubApi {
  /**
   * Set the value of a prop by its pointer. If the prop is sequenced, the value
   * will be a keyframe at the current playhead position (`sequence.position`).
   *
   * @param pointer - A Pointer, like object.props
   * @param value - The value to override the existing value. This is treated as a deep partial value.
   *
   * @example
   * Usage:
   * ```ts
   * const obj = sheet.object("box", {x: 0, y: 0})
   * const scrub = studio.scrub()
   * scrub.capture(({set}) => {
   *   // set a specific prop's value
   *   set(obj.props.x, 10) // New value is {x: 10, y: 0}
   *   // values are set partially
   *   set(obj.props, {y: 11}) // New value is {x: 10, y: 11}
   *
   *   // this will error, as there is no such prop as 'z'
   *   set(obj.props.z, 10)
   * })
   * ```
   */
  set<T>(pointer: Pointer<T>, value: T): void
}

export interface IScrub {
  /**
   * Clears all the ops in the scrub, but keeps the scrub open so you can call
   * `scrub.capture()` again.
   */
  reset(): void
  /**
   * Commits the scrub and creates a single undo level.
   */
  commit(): void
  /**
   * Captures operations for the scrub.
   *
   * Note that running `scrub.capture()` multiple times means all the older
   * calls of `scrub.capture()` will be reset.
   *
   * @example
   * Usage:
   * ```ts
   * scrub.capture(({set}) => {
   *   set(obj.props.x, 10) // set the value of obj.props.x to 10
   * })
   * ```
   */
  capture(fn: (api: IScrubApi) => void): void

  /**
   * Clears the ops of the scrub and destroys it. After calling this,
   * you won't be able to call `scrub.capture()` anymore.
   */
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

          const {root, path} = getPointerParts(pointer)

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
        const {root, path} = getPointerParts(pointer)
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
