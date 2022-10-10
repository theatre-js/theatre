import type {SequenceEditorTree_Sheet} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import React from 'react'
import LeftSheetObjectRow from './SheetObjectRow'
import AnyCompositeRow from './AnyCompositeRow'
import {setCollapsedSheetItem} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'

const SheetRow: React.VFC<{
  leaf: SequenceEditorTree_Sheet
}> = ({leaf}) => {
  return usePrism(() => {
    return (
      <AnyCompositeRow
        leaf={leaf}
        label={leaf.sheet.address.sheetId}
        isCollapsed={leaf.isCollapsed}
        toggleCollapsed={() => {
          setCollapsedSheetItem(!leaf.isCollapsed, {
            sheetAddress: leaf.sheet.address,
            sheetItemKey: leaf.sheetItemKey,
          })
        }}
      >
        {leaf.children.map((sheetObjectLeaf) => (
          <LeftSheetObjectRow
            key={'sheetObject-' + sheetObjectLeaf.sheetObject.address.objectKey}
            leaf={sheetObjectLeaf}
          />
        ))}
      </AnyCompositeRow>
    )
  }, [leaf])
}

export default SheetRow
