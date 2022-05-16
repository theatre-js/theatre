import React, {useContext, useMemo} from 'react'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {prism, val, valueDerivation} from '@theatre/dataverse'
import type {StudioSheetItemKey, SheetId} from '@theatre/shared/utils/ids'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {usePrism} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'

/**
 * Provided via context provided by {@link ProvideCollapsable}.
 */
export function useSequenceEditorCollapsable(
  sheetItemKey: StudioSheetItemKey,
): ICollapsableItem {
  const collapsableContext = useContext(CollapsableContext)
  return useMemo(
    () => collapsableContext.getCollapsable(sheetItemKey),
    [sheetItemKey, collapsableContext],
  )
}

/**
 * Get this via {@link useSequenceEditorCollapsable}
 */
export type ICollapsableItem = {
  isCollapsed: IDerivation<boolean>
  toggleCollapsed(): void
}
type ICollapsableContext = {
  getCollapsable(sheetItemKey: StudioSheetItemKey): ICollapsableItem
}
const CollapsableContext = React.createContext<ICollapsableContext>(null!)
const ProviderChildrenMemo: React.FC<{}> = React.memo(({children}) => (
  <>{children}</>
))

/**
 * Provide a context for managing collapsable items
 * which are useable from {@link useSequenceEditorCollapsable}.
 */
export function ProvideCollapsable(
  props: React.PropsWithChildren<{
    sheetId: SheetId
    layoutP: Pointer<SequenceEditorPanelLayout>
  }>,
) {
  const contextValue = usePrism((): ICollapsableContext => {
    const studio = getStudio()
    const sheetAddress = val(props.layoutP.sheet.address)
    const collapsableItemsSetP =
      getStudio().atomP.ahistoric.projects.stateByProjectId[
        sheetAddress.projectId
      ].stateBySheetId[sheetAddress.sheetId].sequence
        .sequenceEditorCollapsableItems
    const setIsCollapsed = prism.memo(
      'setIsCollapsed',
      () => {
        return function setIsCollapsed(
          studioSheetItemKey: StudioSheetItemKey,
          isCollapsed: boolean,
        ): void {
          studio.transaction(({stateEditors}) => {
            stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.sequenceEditorCollapsableItems.set(
              {...sheetAddress, studioSheetItemKey, isCollapsed},
            )
          })
        }
      },
      [sheetAddress],
    )
    return {
      getCollapsable(itemId) {
        const isCollapsedD = valueDerivation(
          collapsableItemsSetP.byId[itemId].isCollapsed,
        ).map((value) => value ?? false)

        return {
          isCollapsed: isCollapsedD,
          toggleCollapsed() {
            setIsCollapsed(itemId, !isCollapsedD.getValue())
          },
        }
      },
    }
  }, [props.sheetId])
  return (
    <CollapsableContext.Provider value={contextValue}>
      <ProviderChildrenMemo children={props.children} />
    </CollapsableContext.Provider>
  )
}
