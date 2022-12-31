import type {SequenceEditorTree_Sheet} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import React from 'react'
import LeftSheetObjectRow from './SheetObjectRow'
import AnyCompositeRow from './AnyCompositeRow'
import {setCollapsedSheetItem} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import uniqueKeyForAnyObject from '@theatre/shared/utils/uniqueKeyForAnyObject'

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
            key={
              'sheetObject-' +
              // we don't use the object's address as the key because if a user calls `sheet.detachObject(key)` and later
              // calls `sheet.object(key)` with the same key, we want to re-render this row.
              uniqueKeyForAnyObject(sheetObjectLeaf.sheetObject)
            }
            leaf={sheetObjectLeaf}
          />
        ))}
      </AnyCompositeRow>
    )
  }, [leaf])
}

export default SheetRow
