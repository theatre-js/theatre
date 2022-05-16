import type {SequenceEditorTree_SheetObject} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import {decideRowByPropType} from './PropWithChildrenRow'
import {useSequenceEditorCollapsable} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/useSequenceEditorCollapsable'
import {createStudioSheetItemKey} from '@theatre/shared/utils/ids'

const LeftSheetObjectRow: React.VFC<{
  leaf: SequenceEditorTree_SheetObject
}> = ({leaf}) => {
  const collapsable = useSequenceEditorCollapsable(
    createStudioSheetItemKey.forSheetObject(leaf.sheetObject),
  )

  return usePrism(() => {
    return (
      <AnyCompositeRow
        leaf={leaf}
        label={leaf.sheetObject.address.objectKey}
        collapsable={collapsable}
      >
        {leaf.children.map((leaf) => decideRowByPropType(leaf))}
      </AnyCompositeRow>
    )
  }, [leaf])
}

export default LeftSheetObjectRow
