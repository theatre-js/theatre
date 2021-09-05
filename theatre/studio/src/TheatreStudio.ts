import type {IProject, ISheet, ISheetObject} from '@theatre/core'
import studioTicker from '@theatre/studio/studioTicker'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {prism} from '@theatre/dataverse'
import SimpleCache from '@theatre/shared/utils/SimpleCache'
import type {$FixMe, $IntentionalAny, VoidFn} from '@theatre/shared/utils/types'
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
import type {PropTypeConfig_Compound} from '@theatre/core/propTypes'
import {debounce} from 'lodash-es'
import type Sheet from '@theatre/core/sheets/Sheet'

export interface ITransactionAPI {
  set<V>(pointer: Pointer<V>, value: V): void
  unset<V>(pointer: Pointer<V>): void
}
/**
 *
 */
export interface PaneClassDefinition<
  DataType extends PropTypeConfig_Compound<{}>,
> {
  class: string
  component: React.ComponentType<{
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
   */
  globalToolbar?: {
    /**
     * A basic react component.
     */
    component: React.ComponentType<{}>
  }
  /**
   * Introduces new pane types.
   */
  panes?: Array<PaneClassDefinition<$FixMe>>
}

export type PaneInstance<ClassName extends string> = {
  extensionId: string
  instanceId: string
  definition: PaneClassDefinition<$FixMe>
}
/**
 * This is the public api of Theatre's studio. It is exposed through:
 *
 * Basic usage:
 * ```ts
 * import studio from '@theatre/studio'
 *
 * studio.initialize()
 * ```
 *
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
  readonly ui: {
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

  /**
   * Initializes the studio. Call it once in your index.js/index.ts module.
   * It silently ignores subsequent calls.
   */
  initialize(): void

  transaction(fn: (api: ITransactionAPI) => void): void
  scrub(): IScrub
  debouncedScrub(threshhold: number): Pick<IScrub, 'capture'>

  /**
   * Sets the current selection.
   *
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
  setSelection(selection: Array<ISheetObject | ISheet>): void

  /**
   * Calls fn every time the current selection changes.
   */
  onSelectionChange(fn: (s: Array<ISheetObject | ISheet>) => void): VoidFunction

  /**
   * The current selection, consisting of Sheets and Sheet Objects
   *
   * Example:
   * ```ts
   * console.log(studio.selection) // => [ISheetObject, ISheet]
   * ```
   */
  readonly selection: Array<ISheetObject | ISheet>

  /**
   * Registers an extension
   */
  extend(
    /**
     * The extension's definition
     */
    extension: IExtension,
  ): void

  getPanesOfType<PaneClass extends string>(
    paneClass: PaneClass,
  ): Array<PaneInstance<PaneClass>>

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

  initialize() {
    getStudio().ui.render()
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

  getPanesOfType<PaneClass extends string>(
    paneClass: PaneClass,
  ): PaneInstance<PaneClass>[] {
    return getStudio().paneManager.getPanesOfType(paneClass)
  }

  createPane<PaneClass extends string>(
    paneClass: PaneClass,
  ): PaneInstance<PaneClass> {
    return getStudio().paneManager.createPane(paneClass)
  }

  destroyPane(paneId: string): void {
    return getStudio().paneManager.destroyPane(paneId)
  }
}
