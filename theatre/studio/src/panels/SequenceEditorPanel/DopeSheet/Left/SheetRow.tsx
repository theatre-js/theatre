import type {SequenceEditorTree_Sheet} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import React from 'react'
import SheetObjectRow from './SheetObjectRow'

const SheetRow: React.VFC<{
  leaf: SequenceEditorTree_Sheet
}> = ({leaf}) => {
  return usePrism(() => {
    return (
      <>
        {leaf.children.map((sheetObjectLeaf) => (
          <SheetObjectRow
            key={'sheetObject-' + sheetObjectLeaf.sheetObject.address.objectKey}
            leaf={sheetObjectLeaf}
          />
        ))}
      </>
    )
  }, [leaf])
}

export default SheetRow
