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

export interface PaneClassDefinition<
  DataType extends PropTypeConfig_Compound<{}>,
> {
  class: string
  dataType: DataType
  component: React.ComponentType<{
    paneId: string
  }>
}

export type IExtension = {
  id: string
  globalToolbar?: {
    component: React.ComponentType<{}>
  }
  panes?: Array<PaneClassDefinition<$FixMe>>
}

export type PaneInstance<ClassName extends string> = {
  extensionId: string
  instanceId: string
  definition: PaneClassDefinition<$FixMe>
}

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
   * Initializes the studio. Call this in your index.js/index.ts module.
   *
   * Usage with **tree-shaking**:
   * ```ts
   * import studio from '@theratre/studio'
   *
   * // Add this check if you wish to not include the studio in your production bundle
   * if (process.env.NODE_ENV === "development") {
   *   studio.initialize()
   * }
   * ```
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
   */
  readonly selection: Array<ISheetObject | ISheet>

  extend(extension: IExtension): void

  getPanesOfType<PaneClass extends string>(
    paneClass: PaneClass,
  ): Array<PaneInstance<PaneClass>>

  createPane<PaneClass extends string>(
    paneClass: PaneClass,
  ): PaneInstance<PaneClass>

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

  get selection(): (ISheetObject | ISheet)[] {
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
