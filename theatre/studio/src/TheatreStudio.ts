import type {ISheetObject} from '@theatre/core'
import studioTicker from '@theatre/studio/studioTicker'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {prism} from '@theatre/dataverse'
import {privateAPI, setPrivateAPI} from '@theatre/shared/privateAPIs'
import SimpleCache from '@theatre/shared/utils/SimpleCache'
import type {VoidFn} from '@theatre/shared/utils/types'
import type {IScrub} from '@theatre/studio/Scrub'

import type Studio from '@theatre/studio/Studio'
import {isSheetObjectPublicAPI} from '@theatre/shared/instanceTypes'
import {getOutlineSelection} from './selectors'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'

export interface ITransactionAPI {
  set<V>(pointer: Pointer<V>, value: V): void
  unset<V>(pointer: Pointer<V>): void
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
}

export default class TheatreStudio implements IStudio {
  readonly ui = {
    show() {
      privateAPI(this).ui.show()
    },

    hide() {
      privateAPI(this).ui.hide()
    },

    get showing(): boolean {
      return privateAPI(this).ui._showing
    },

    restore() {
      privateAPI(this).ui.restore()
    },
  }

  private readonly _cache = new SimpleCache()

  /**
   * @internal
   */
  constructor(internals: Studio) {
    setPrivateAPI(this, internals)
    setPrivateAPI(this.ui, internals)
  }

  transaction(fn: (api: ITransactionAPI) => void): void {
    return privateAPI(this).transaction(({set, unset}) => {
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
      .map((s) => privateAPI(s))

    privateAPI(this).transaction(({stateEditors}) => {
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
    return privateAPI(this).scrub()
  }
}
