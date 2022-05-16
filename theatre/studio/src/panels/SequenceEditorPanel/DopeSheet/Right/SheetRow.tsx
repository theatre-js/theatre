import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_Sheet} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import React from 'react'
import RightSheetObjectRow from './SheetObjectRow'

const SheetRow: React.FC<{
  leaf: SequenceEditorTree_Sheet
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return usePrism(() => {
    return (
      <>
        {leaf.children.map((sheetObjectLeaf) => (
          <RightSheetObjectRow
            layoutP={layoutP}
            key={'sheetObject-' + sheetObjectLeaf.sheetObject.address.objectKey}
            leaf={sheetObjectLeaf}
          />
        ))}
      </>
    )
  }, [leaf, layoutP])
}

export default SheetRow
