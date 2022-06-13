import type {SequenceEditorTree_SheetObject} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import {decideRowByPropType} from './PropWithChildrenRow'
import {setCollapsedSheetObjectOrCompoundProp} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import getStudio from '@theatre/studio/getStudio'

const LeftSheetObjectRow: React.VFC<{
  leaf: SequenceEditorTree_SheetObject
}> = ({leaf}) => {
  return (
    <AnyCompositeRow
      leaf={leaf}
      label={leaf.sheetObject.address.objectKey}
      isCollapsed={leaf.isCollapsed}
      toggleSelect={() => {
        // set selection to this sheet object on click
        getStudio().transaction(({stateEditors}) => {
          stateEditors.studio.historic.panels.outline.selection.set([
            leaf.sheetObject,
          ])
        })
      }}
      toggleCollapsed={() =>
        setCollapsedSheetObjectOrCompoundProp(!leaf.isCollapsed, leaf)
      }
    >
      {leaf.children.map((leaf) => decideRowByPropType(leaf))}
    </AnyCompositeRow>
  )
}

export default LeftSheetObjectRow
