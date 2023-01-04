import type Project from '@theatre/core/projects/Project'
import {useCallback} from 'react'
import getStudio from '@theatre/studio/getStudio'
import {useVal} from '@theatre/react'
import type Sheet from '@theatre/core/sheets/Sheet'

export function useCollapseStateInOutlinePanel(
  item: Project | Sheet | {type: 'namespace'; sheet: Sheet; path: string[]},
): {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
} {
  const itemKey =
    item.type === 'namespace'
      ? `namespace:${item.sheet.address.sheetId}:${item.path.join('/')}`
      : item.type === 'Theatre_Project'
      ? 'project'
      : item.type === 'Theatre_Sheet'
      ? `sheetInstance:${item.address.sheetId}:${item.address.sheetInstanceId}`
      : 'unknown'

  const projectId =
    item.type === 'namespace'
      ? item.sheet.address.projectId
      : item.address.projectId

  const isCollapsed =
    useVal(
      getStudio().atomP.ahistoric.projects.stateByProjectId[projectId]
        .collapsedItemsInOutline[itemKey],
    ) ?? false

  const setCollapsed = useCallback(
    (isCollapsed: boolean) => {
      getStudio().transaction(({stateEditors}) => {
        stateEditors.studio.ahistoric.projects.stateByProjectId.collapsedItemsInOutline.set(
          {projectId, isCollapsed, itemKey: itemKey},
        )
      })
    },
    [itemKey],
  )

  return {collapsed: isCollapsed, setCollapsed}
}
