import type {IProject, ISheet, ISheetObject} from '@theatre/core'
import studioTicker from '@theatre/studio/studioTicker'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {prism} from '@theatre/dataverse'
import SimpleCache from '@theatre/shared/utils/SimpleCache'
import type {$IntentionalAny, VoidFn} from '@theatre/shared/utils/types'
import type {IScrub} from '@theatre/studio/Scrub'
import type {Studio} from '@theatre/studio/Studio'
import {
  isSheetObjectPublicAPI,
  isSheetPublicAPI,
} from '@theatre/shared/instanceTypes'
import {getOutlineSelection} from './selectors'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import getStudio from './getStudio'
import type React from 'react'
import {debounce} from 'lodash-es'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {PaneInstanceId, ProjectId} from '@theatre/shared/utils/ids'

export interface ITransactionAPI {
  /**
   * Set the value of a prop by its pointer. If the prop is sequenced, the value
   * will be a keyframe at the current sequence position.
   *
   * @example
   * Usage:
   * ```ts
   * const obj = sheet.object("box", {x: 0, y: 0})
   * studio.transaction(({set}) => {
   *   // set a specific prop's value
   *   set(obj.props.x, 10) // New value is {x: 10, y: 0}
   *   // values are set partially
   *   set(obj.props, {y: 11}) // New value is {x: 10, y: 11}
   *
   *   // this will error, as there is no such prop as 'z'
   *   set(obj.props.z, 10)
   * })
   * ```
   * @param pointer - A Pointer, like object.props
   * @param value - The value to override the existing value. This is treated as a deep partial value.
   */
  set<V>(pointer: Pointer<V>, value: V): void
  /**
   * Unsets the value of a prop by its pointer.
   *
   * @example
   * Usage:
   * ```ts
   * const obj = sheet.object("box", {x: 0, y: 0})
   * studio.transaction(({set}) => {
   *   // set props.x to its default value
   *   unset(obj.props.x)
   *   // set all props to their default value
   *   set(obj.props)
   * })
   * ```
   * @param pointer - A pointer, like object.props
   */
  unset<V>(pointer: Pointer<V>): void
}
/**
 *
 */
export interface PaneClassDefinition {
  /**
   * Each pane has a `class`, which is a string.
   */
  class: string
  /**
   * A react component that renders the content of the pane. It is given
   * a single prop, `paneId`, which is a unique identifier for the pane.
   *
   * If you wish to store and persist the state of the pane,
   * simply use a sheet and an object.
   */
  component: React.ComponentType<{
    /**
     * The unique identifier of the pane
     */
    paneId: string
  }>
}

/**
 * A Theatre.js Studio extension. You can define one either
 * in a separate package, or within your project.
 */
export interface IExtension {
  /**
   * Pick a unique ID for your extension. Ideally the name would be unique if
   * the extension was to be published to the npm repository.
   */
  id: string
  /**
   * Set this if you'd like to add a component to the global toolbar (on the top)
   *
   * @example
   * TODO
   */
  globalToolbar?: {
    /**
     * A basic react component.
     *
     * @example
     * TODO
     */
    component: React.ComponentType<{}>
  }
  /**
   * Introduces new pane types.
   * @example
   * TODO
   */
  panes?: Array<PaneClassDefinition>
}

export type PaneInstance<ClassName extends string> = {
  extensionId: string
  instanceId: PaneInstanceId
  definition: PaneClassDefinition
}

export interface IStudioUI {
  /**
   * Temporarily hides the studio
   */
  hide(): void
  /**
   * Whether the studio is currently visible or hidden
   */
  readonly isHidden: boolean
  /**
   * Makes the studio visible again.
   */
  restore(): void
}

export interface _StudioInitializeOpts {
  /**
   * The local storage key to use to persist the state.
   *
   * Default: "theatrejs:0.4"
   */
  persistenceKey?: string
  /**
   * Whether to persist the changes in the browser's temporary storage.
   * It is useful to set this to false in the test environment or when debugging things.
   *
   * Default: true
   */
  usePersistentStorage?: boolean
}

/**
 * This is the public api of Theatre's studio. It is exposed through:
 *
 * @example
 * Basic usage:
 * ```ts
 * import studio from '@theatre/studio'
 *
 * studio.initialize()
 * ```
 *
 * @example
 * Usage with **tree-shaking**:
 * ```ts
 * import studio from '@theatre/studio'
 *
 * if (process.env.NODE_ENV !== 'production') {
 *   studio.initialize()
 * }
 * ```
 */
export interface IStudio {
  readonly ui: IStudioUI

  /**
   * Initializes the studio. Call it once in your index.js/index.ts module.
   * It silently ignores subsequent calls.
   */
  initialize(opts?: _StudioInitializeOpts): void

  /**
   * Runs an undo-able transaction. Creates a single undo level for all
   * the operations inside the transaction.
   *
   * Will roll back if an error is thrown.
   *
   * @example
   * Usage:
   * ```ts
   * studio.transaction(({set, unset}) => {
   *   set(obj.props.x, 10) // set the value of obj.props.x to 10
   *   unset(obj.props.y) // unset the override at obj.props.y
   * })
   * ```
   */
  transaction(fn: (api: ITransactionAPI) => void): void

  /**
   * Creates a scrub, which is just like a transaction, except you
   * can run it multiple times without creating extra undo levels.
   *
   * @example
   * Usage:
   * ```ts
   * const scrub = studio.scrub()
   * scrub.capture(({set}) => {
   *   set(obj.props.x, 10) // set the value of obj.props.x to 10
   * })
   *
   * // half a second later...
   * scrub.capture(({set}) => {
   *   set(obj.props.y, 11) // set the value of obj.props.y to 11
   *   // note that since we're not setting obj.props.x, its value reverts back to its old value (ie. not 10)
   * })
   *
   * // then either:
   * scrub.commit() // commits the scrub and creates a single undo level
   * // or:
   * scrub.reset() // clear all the ops in the scrub so we can run scrub.capture() again
   * // or:
   * scrub.discard() // clears the ops and destroys it (ie. can't call scrub.capture() anymore)
   * ```
   */
  scrub(): IScrub

  /**
   * Creates a debounced scrub, which is just like a normal scrub, but
   * automatically runs scrub.commit() after `threshhold` milliseconds have
   * passed after the last `scrub.capture`.
   *
   * @param threshhold - How long to wait before committing the scrub
   *
   * @example
   * Usage:
   * ```ts
   * // Will create a new undo-level after 2 seconds have passed
   * // since the last scrub.capture()
   * const scrub = studio.debouncedScrub(2000)
   *
   * // capture some ops
   * scrub.capture(...)
   * // wait one second
   * await delay(1000)
   * // capture more ops but no new undo level is made,
   * // because the last scrub.capture() was called less than 2 seconds ago
   * scrub.capture(...)
   *
   * // wait another seonc and half
   * await delay(1500)
   * // still no new undo level, because less than 2 seconds have passed
   * // since the last capture
   * scrub.capture(...)
   *
   * // wait 3 seconds
   * await delay(3000) // at this point, one undo level is created.
   *
   * // this call to capture will start a new undo level
   * scrub.capture(...)
   * ```
   */
  debouncedScrub(threshhold: number): Pick<IScrub, 'capture'>

  /**
   * Sets the current selection.
   *
   * @example
   * Usage:
   * ```ts
   * const sheet1: ISheet = ...
   * const obj1: ISheetObject<any> = ...
   *
   * studio.setSelection([sheet1, obj1])
   * ```
   *
   * You can read the current selection from studio.selection
   */
  setSelection(selection: Array<ISheetObject<any> | ISheet>): void

  /**
   * Calls fn every time the current selection changes.
   */
  onSelectionChange(
    fn: (s: Array<ISheetObject<{}> | ISheet>) => void,
  ): VoidFunction

  /**
   * The current selection, consisting of Sheets and Sheet Objects
   *
   * @example
   * Usage:
   * ```ts
   * console.log(studio.selection) // => [ISheetObject, ISheet]
   * ```
   */
  readonly selection: Array<ISheetObject<{}> | ISheet>

  /**
   * Registers an extension
   */
  extend(
    /**
     * The extension's definition
     */
    extension: IExtension,
  ): void

  /**
   * Creates a new pane
   *
   * @param paneClass - The class name of the pane (provided by an extension)
   */
  createPane<PaneClass extends string>(
    paneClass: PaneClass,
  ): PaneInstance<PaneClass>

  /**
   * Returns the Theatre.js project that contains the studio's sheets and objects.
   *
   * It is useful if you'd like to have sheets/objects that are present only when
   * studio is present.
   */
  getStudioProject(): IProject

  /**
   * Creates a JSON object that contains the state of the project. You can use this
   * to programmatically save the state of your projects to the storage system of your
   * choice, rather than manually clicking on the "Export" button in the UI.
   *
   * @param projectId - same projectId as in `core.getProject(projectId)`
   *
   * @example
   * Usage:
   * ```ts
   * const projectId = "project"
   * const json = studio.createContentOfSaveFile(projectId)
   * const string = JSON.stringify(json)
   * fetch(`/projects/${projectId}/state`, {method: 'POST', body: string}).then(() => {
   *   console.log("Saved")
   * })
   * ```
   */
  createContentOfSaveFile(projectId: string): Record<string, unknown>
}

export default class TheatreStudio implements IStudio {
  readonly ui = {
    hide() {
      getStudio().ui.hide()
    },

    get isHidden(): boolean {
      return getStudio().ui.isHidden
    },

    restore() {
      getStudio().ui.restore()
    },
  }

  private readonly _cache = new SimpleCache()

  /**
   * @internal
   */
  constructor(internals: Studio) {}

  initialize(opts?: Parameters<IStudio['initialize']>[0]): Promise<void> {
    const studio = getStudio()
    return studio.initialize(opts)
  }

  extend(extension: IExtension): void {
    getStudio().extend(extension)
  }

  transaction(fn: (api: ITransactionAPI) => void): void {
    return getStudio().transaction(({set, unset}) => {
      return fn({set, unset})
    })
  }

  private _getSelectionDerivation(): IDerivation<(ISheetObject | ISheet)[]> {
    return this._cache.get('_getStateDerivation()', () =>
      prism((): (ISheetObject | ISheet)[] => {
        return getOutlineSelection()
          .filter(
            (s): s is SheetObject | Sheet =>
              s.type === 'Theatre_SheetObject' || s.type === 'Theatre_Sheet',
          )
          .map((s) => s.publicApi)
      }),
    )
  }

  private _getSelection(): (ISheetObject | ISheet)[] {
    return this._getSelectionDerivation().getValue()
  }

  setSelection(selection: Array<ISheetObject | ISheet>): void {
    const sanitizedSelection = [...selection]
      .filter((s) => isSheetObjectPublicAPI(s) || isSheetPublicAPI(s))
      .map((s) => getStudio().corePrivateAPI!(s))

    getStudio().transaction(({stateEditors}) => {
      stateEditors.studio.historic.panels.outline.selection.set(
        sanitizedSelection,
      )
    })
  }

  onSelectionChange(fn: (s: (ISheetObject | ISheet)[]) => void): VoidFn {
    return this._getSelectionDerivation().tapImmediate(studioTicker, fn)
  }

  get selection(): Array<ISheetObject | ISheet> {
    return this._getSelection()
  }

  scrub(): IScrub {
    return getStudio().scrub()
  }

  getStudioProject() {
    const core = getStudio().core
    if (!core) {
      throw new Error(`You're calling studio.getStudioProject() before \`@theatre/core\` is loaded. To fix this:
1. Check if \`@theatre/core\` is import/required in your bundle.
2. Check the stack trace of this error and make sure the funciton that calls getStudioProject() is run after \`@theatre/core\` is loaded.`)
    }
    return getStudio().getStudioProject(core)
  }

  debouncedScrub(threshold: number = 1000): Pick<IScrub, 'capture'> {
    let currentScrub: IScrub | undefined
    const scheduleCommit = debounce(() => {
      const s = currentScrub
      if (!s) return
      currentScrub = undefined
      s.commit()
    }, threshold)

    const capture = (arg: $IntentionalAny) => {
      if (!currentScrub) {
        currentScrub = this.scrub()
      }
      let errored = true
      try {
        currentScrub.capture(arg)
        errored = false
      } finally {
        if (errored) {
          const s = currentScrub
          currentScrub = undefined
          s.discard()
        } else {
          scheduleCommit()
        }
      }
    }

    return {capture}
  }

  createPane<PaneClass extends string>(
    paneClass: PaneClass,
  ): PaneInstance<PaneClass> {
    return getStudio().paneManager.createPane(paneClass)
  }

  destroyPane(paneId: string): void {
    return getStudio().paneManager.destroyPane(paneId as PaneInstanceId)
  }

  createContentOfSaveFile(projectId: string): Record<string, unknown> {
    return getStudio().createContentOfSaveFile(
      projectId as ProjectId,
    ) as $IntentionalAny
  }
}
