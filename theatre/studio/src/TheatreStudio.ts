import type {ISheetObject} from '@theatre/core'
import studioTicker from '@theatre/studio/studioTicker'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {prism} from '@theatre/dataverse'
import SimpleCache from '@theatre/shared/utils/SimpleCache'
import type {$FixMe, VoidFn} from '@theatre/shared/utils/types'
import type {IScrub} from '@theatre/studio/Scrub'

import type {Studio} from '@theatre/studio/Studio'
import {isSheetObjectPublicAPI} from '@theatre/shared/instanceTypes'
import {getOutlineSelection} from './selectors'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import getStudio from './getStudio'
import type React from 'react'
import type {
  PropTypeConfig_Boolean,
  PropTypeConfig_Compound,
} from '@theatre/core/propTypes'

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
    id: string
    object: ISheetObject<
      PropTypeConfig_Compound<{
        visible: PropTypeConfig_Boolean
        data: DataType
      }>
    >
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
  object: ISheetObject<
    PropTypeConfig_Compound<{data: $FixMe; visible: PropTypeConfig_Boolean}>
  >
  definition: PaneClassDefinition<$FixMe>
}

export interface IStudio {
  readonly ui: {
    show(): void
    hide(): void
    readonly showing: boolean
    restore(): void
  }

  transaction(fn: (api: ITransactionAPI) => void): void
  scrub(): IScrub

  __experimental_setSelection(selection: Array<ISheetObject>): void
  __experimental_onSelectionChange(
    fn: (s: Array<ISheetObject>) => void,
  ): VoidFunction

  readonly selection: Array<ISheetObject>

  extend(extension: IExtension): void

  getPanesOfType<PaneClass extends string>(
    paneClass: PaneClass,
  ): Array<PaneInstance<PaneClass>>

  createPane<PaneClass extends string>(
    paneClass: PaneClass,
  ): PaneInstance<PaneClass>
}

export default class TheatreStudio implements IStudio {
  readonly ui = {
    show() {
      getStudio().ui.show()
    },

    hide() {
      getStudio().ui.hide()
    },

    get showing(): boolean {
      return getStudio().ui._showing
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

  extend(extension: IExtension): void {
    getStudio().extend(extension)
  }

  transaction(fn: (api: ITransactionAPI) => void): void {
    return getStudio().transaction(({set, unset}) => {
      return fn({set, unset})
    })
  }

  private _getSelectionDerivation(): IDerivation<ISheetObject[]> {
    return this._cache.get('_getStateDerivation()', () =>
      prism((): ISheetObject[] => {
        return getOutlineSelection()
          .filter((s): s is SheetObject => s.type === 'Theatre_SheetObject')
          .map((s) => s.publicApi)
      }),
    )
  }

  private _getSelection(): ISheetObject[] {
    return this._getSelectionDerivation().getValue()
  }

  __experimental_setSelection(selection: Array<ISheetObject>): void {
    const sanitizedSelection = [...selection]
      .filter((s) => isSheetObjectPublicAPI(s))
      .map((s) => getStudio().corePrivateAPI!(s))

    getStudio().transaction(({stateEditors}) => {
      stateEditors.studio.historic.panels.outline.selection.set(
        sanitizedSelection,
      )
    })
  }

  __experimental_onSelectionChange(fn: (s: ISheetObject[]) => void): VoidFn {
    return this._getSelectionDerivation().tapImmediate(studioTicker, fn)
  }

  get selection(): ISheetObject[] {
    return this._getSelection()
  }

  scrub(): IScrub {
    return getStudio().scrub()
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
}
