import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import getStudio from '@theatre/studio/getStudio'
import React from 'react'
import BaseItem from '@theatre/studio/panels/OutlinePanel/BaseItem'
import {usePrism} from '@theatre/dataverse-react'
import {getOutlineSelection} from '@theatre/studio/selectors'

export const ObjectItem: React.FC<{
  sheetObject: SheetObject
  depth: number
}> = ({sheetObject, depth}) => {
  const select = () => {
    getStudio()!.transaction(({stateEditors}) => {
      stateEditors.studio.historic.panels.outline.selection.set([sheetObject])
    })
  }

  const selection = usePrism(() => getOutlineSelection(), [])

  return (
    <BaseItem
      select={select}
      label={sheetObject.address.objectKey}
      depth={depth}
      selectionStatus={
        selection.includes(sheetObject) ? 'selected' : 'not-selected'
      }
    />
  )
}
