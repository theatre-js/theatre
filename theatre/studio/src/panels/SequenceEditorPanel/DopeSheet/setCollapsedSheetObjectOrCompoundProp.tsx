import type {StudioSheetItemKey} from '@theatre/shared/utils/ids'
import {createStudioSheetItemKey} from '@theatre/shared/utils/ids'
import getStudio from '@theatre/studio/getStudio'
import type {PathToProp} from '@theatre/shared/utils/addresses'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'

// discriminated union
export function setCollapsedSheetObjectOrCompoundProp(
  isCollapsed: boolean,
  toCollapse:
    | {
        sheetObject: SheetObject
      }
    | {
        sheetObject: SheetObject
        pathToProp: PathToProp
      },
) {
  const itemKey: StudioSheetItemKey =
    'pathToProp' in toCollapse
      ? createStudioSheetItemKey.forSheetObjectProp(
          toCollapse.sheetObject,
          toCollapse.pathToProp,
        )
      : createStudioSheetItemKey.forSheetObject(toCollapse.sheetObject)

  getStudio().transaction(({stateEditors}) => {
    stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.sequenceEditorCollapsableItems.set(
      {
        ...toCollapse.sheetObject.address,
        studioSheetItemKey: itemKey,
        isCollapsed,
      },
    )
  })
}
