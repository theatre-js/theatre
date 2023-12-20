import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import getStudio from '@theatre/studio/getStudio'
import React from 'react'
import BaseItem from '@theatre/studio/panels/OutlinePanel/BaseItem'
import {useVal} from '@theatre/react'
import {outlineSelection} from '@theatre/studio/selectors'
import useChordial from '@theatre/studio/uiComponents/chordial/useChodrial'

export const ObjectItem: React.VFC<{
  sheetObject: SheetObject
  depth: number
  overrideLabel?: string
}> = ({sheetObject, depth, overrideLabel}) => {
  const select = () => {
    getStudio()!.transaction(({stateEditors}) => {
      stateEditors.studio.historic.panels.outline.selection.set([
        {...sheetObject.address, type: 'SheetObject'},
      ])
    })
  }

  const selection = useVal(outlineSelection)

  const {targetRef} = useChordial(() => {
    return {
      title: `Object: ${sheetObject.address.objectKey}`,
      items: [],
    }
  })

  return (
    <BaseItem
      select={select}
      label={overrideLabel ?? sheetObject.address.objectKey}
      depth={depth}
      headerRef={targetRef}
      selectionStatus={
        selection.includes(sheetObject) ? 'selected' : 'not-selected'
      }
    />
  )
}
