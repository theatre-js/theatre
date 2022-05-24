import type {SequenceEditorTree_SheetObject} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import {decideRowByPropType} from './PropWithChildrenRow'
import {setCollapsedSheetObjectOrCompoundProp} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'

const LeftSheetObjectRow: React.VFC<{
  leaf: SequenceEditorTree_SheetObject
}> = ({leaf}) => {
  return usePrism(() => {
    return (
      <AnyCompositeRow
        leaf={leaf}
        label={leaf.sheetObject.address.objectKey}
        isCollapsed={leaf.isCollapsed}
        toggleCollapsed={() =>
          setCollapsedSheetObjectOrCompoundProp(!leaf.isCollapsed, leaf)
        }
      >
        {leaf.children.map((leaf) => decideRowByPropType(leaf))}
      </AnyCompositeRow>
    )
  }, [leaf])
}

export default LeftSheetObjectRow
