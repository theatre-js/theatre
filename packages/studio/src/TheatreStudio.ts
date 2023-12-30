import type {ISheet, ISheetObject} from '@theatre/core'
import type {Prism, Pointer} from '@theatre/dataverse'
import {getPointerParts, prism} from '@theatre/dataverse'
import SimpleCache from '@theatre/utils/SimpleCache'
import type {$IntentionalAny, VoidFn} from '@theatre/core/types/public'
import type {IScrub} from '@theatre/core/types/public'
import type {Studio} from '@theatre/studio/Studio'
import {outlineSelection} from './selectors'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import getStudio from './getStudio'
import {debounce, uniq} from 'lodash-es'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {
  IExtension,
  IStudio,
  ITransactionAPI,
  PaneInstance,
  ProjectId,
} from '@theatre/core/types/public'
import {
  __experimental_disablePlayPauseKeyboardShortcut,
  __experimental_enablePlayPauseKeyboardShortcut,
} from './UIRoot/useKeyboardShortcuts'
import type TheatreSheetObject from '@theatre/core/sheetObjects/TheatreSheetObject'
import type TheatreSheet from '@theatre/core/sheets/TheatreSheet'
import type {__UNSTABLE_Project_OnDiskState} from '@theatre/core'
import type {OutlineSelectionState} from '@theatre/core/types/private/studio'
import type Project from '@theatre/core/projects/Project'
import type SheetTemplate from '@theatre/core/sheets/SheetTemplate'
import type SheetObjectTemplate from '@theatre/core/sheetObjects/SheetObjectTemplate'
import type {PaneInstanceId} from '@theatre/core/types/public'
import {__private} from '@theatre/core'
const {
  isSheet,
  isProject,
  isSheetPublicAPI,
  isSheetObject,
  isSheetObjectPublicAPI,
  isSheetObjectTemplate,
  isSheetTemplate,
} = __private.instanceTypes

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

    renderToolset(toolsetId: string, htmlNode: HTMLElement) {
      return getStudio().ui.renderToolset(toolsetId, htmlNode)
    },
  }

  private readonly _cache = new SimpleCache()

  __experimental = {
    __experimental_disablePlayPauseKeyboardShortcut(): void {
      // This is an experimental API to respond to this issue: https://discord.com/channels/870988717190426644/870988717190426647/1067906775602430062
      // Ideally we need a coherent way for the user to control keyboard inputs, so we will remove this method in the future.
      // Here is the procedure for removing it:
      // 1. Replace this code with a `throw new Error("This is experimental method is now deprecated, and here is how to migrate: ...")`
      // 2. Then keep it for a few months, and then remove it.
      __experimental_disablePlayPauseKeyboardShortcut()
    },
    __experimental_enablePlayPauseKeyboardShortcut(): void {
      // see __experimental_disablePlayPauseKeyboardShortcut()
      __experimental_enablePlayPauseKeyboardShortcut()
    },
    __experimental_clearPersistentStorage(persistenceKey?: string): void {
      return getStudio().clearPersistentStorage(persistenceKey)
    },
    __experimental_createContentOfSaveFileTyped(
      projectId: string,
    ): __UNSTABLE_Project_OnDiskState {
      return getStudio().createContentOfSaveFile(projectId) as $IntentionalAny
    },
  }

  /**
   * @internal
   */
  constructor(internals: Studio) {}

  extend(
    extension: IExtension,
    opts?: {__experimental_reconfigure?: boolean},
  ): void {
    getStudio().extend(extension, opts)
  }

  transaction(fn: (api: ITransactionAPI) => void) {
    getStudio().transaction(({set, unset, stateEditors}) => {
      const __experimental_forgetObject = (object: TheatreSheetObject) => {
        if (!isSheetObjectPublicAPI(object)) {
          throw new Error(
            `object in transactionApi.__experimental_forgetObject(object) must be the return type of sheet.object(...)`,
          )
        }

        stateEditors.coreByProject.historic.sheetsById.forgetObject(
          object.address,
        )
      }

      const __experimental_forgetSheet = (sheet: TheatreSheet) => {
        if (!isSheetPublicAPI(sheet)) {
          throw new Error(
            `sheet in transactionApi.__experimental_forgetSheet(sheet) must be the return type of project.sheet()`,
          )
        }

        stateEditors.coreByProject.historic.sheetsById.forgetSheet(
          sheet.address,
        )
      }

      const __experimental_sequenceProp = <V>(prop: Pointer<V>) => {
        const {path, root} = getPointerParts(prop)

        if (!isSheetObject(root)) {
          throw new Error(
            'Argument prop must be a pointer to a SheetObject property',
          )
        }

        const propAdress = {...root.address, pathToProp: path}

        stateEditors.coreByProject.historic.sheetsById.sequence.setPrimitivePropAsSequenced(
          propAdress,
        )
      }

      return fn({
        set,
        unset,
        __experimental_forgetObject,
        __experimental_forgetSheet,
        __experimental_sequenceProp,
      })
    })
  }

  private _getSelectionPrism(): Prism<(ISheetObject | ISheet)[]> {
    return this._cache.get('_getSelectionPrism()', () =>
      prism((): (ISheetObject | ISheet)[] => {
        return outlineSelection
          .getValue()
          .filter(
            (s): s is SheetObject | Sheet =>
              s.type === 'Theatre_SheetObject' || s.type === 'Theatre_Sheet',
          )
          .map((s) => s.publicApi)
      }),
    )
  }

  private _getSelection(): (ISheetObject | ISheet)[] {
    return this._getSelectionPrism().getValue()
  }

  setSelection(selection: Array<ISheetObject | ISheet>): void {
    const sanitizedSelection: Array<
      Project | Sheet | SheetObject | SheetTemplate | SheetObjectTemplate
    > = [...selection]
      .filter((s) => isSheetObjectPublicAPI(s) || isSheetPublicAPI(s))
      .map((s) => getStudio().corePrivateAPI!(s))

    getStudio().transaction(({stateEditors}) => {
      const newSelectionState: OutlineSelectionState[] = []

      for (const item of uniq(sanitizedSelection)) {
        if (isProject(item)) {
          newSelectionState.push({type: 'Project', ...item.address})
        } else if (isSheet(item)) {
          newSelectionState.push({
            type: 'Sheet',
            ...item.template.address,
          })
          stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId.setSelectedInstanceId(
            item.address,
          )
        } else if (isSheetTemplate(item)) {
          newSelectionState.push({type: 'Sheet', ...item.address})
        } else if (isSheetObject(item)) {
          newSelectionState.push({
            type: 'SheetObject',
            ...item.template.address,
          })
          stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId.setSelectedInstanceId(
            item.sheet.address,
          )
        } else if (isSheetObjectTemplate(item)) {
          newSelectionState.push({type: 'SheetObject', ...item.address})
        }
      }
      stateEditors.studio.historic.panels.outline.selection.set(
        newSelectionState,
      )
    })
  }

  onSelectionChange(fn: (s: (ISheetObject | ISheet)[]) => void): VoidFn {
    const studio = getStudio()

    return this._getSelectionPrism().onChange(studio.ticker, fn, true)
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
