import getStudio from '@theatre/studio/getStudio'
import type {
  SheetAddress,
  WithoutSheetInstance,
} from '@theatre/core/types/public'
import type {StudioSheetItemKey} from '@theatre/core/types/private'

export function setCollapsedSheetItem(
  isCollapsed: boolean,
  toCollapse: {
    sheetAddress: WithoutSheetInstance<SheetAddress>
    sheetItemKey: StudioSheetItemKey
  },
) {
  getStudio().transaction(({stateEditors}) => {
    stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.sequenceEditorCollapsableItems.set(
      {
        ...toCollapse.sheetAddress,
        studioSheetItemKey: toCollapse.sheetItemKey,
        isCollapsed,
      },
    )
  })
}
