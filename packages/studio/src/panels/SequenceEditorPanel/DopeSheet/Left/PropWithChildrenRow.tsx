import type {
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import PrimitivePropRow from './PrimitivePropRow'
import {setCollapsedSheetItem} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'

export const decideRowByPropType = (
  leaf: SequenceEditorTree_PropWithChildren | SequenceEditorTree_PrimitiveProp,
): React.ReactElement => {
  const key = 'prop' + leaf.pathToProp[leaf.pathToProp.length - 1]
  return leaf.shouldRender ? (
    leaf.type === 'propWithChildren' ? (
      <PropWithChildrenRow leaf={leaf} key={key} />
    ) : (
      <PrimitivePropRow leaf={leaf} key={key} />
    )
  ) : (
    <React.Fragment key={key} />
  )
}

const PropWithChildrenRow: React.VFC<{
  leaf: SequenceEditorTree_PropWithChildren
}> = ({leaf}) => {
  return (
    <AnyCompositeRow
      leaf={leaf}
      label={leaf.pathToProp[leaf.pathToProp.length - 1]}
      isCollapsed={leaf.isCollapsed}
      toggleCollapsed={() =>
        setCollapsedSheetItem(!leaf.isCollapsed, {
          sheetAddress: leaf.sheetObject.address,
          sheetItemKey: leaf.sheetItemKey,
        })
      }
    >
      {leaf.children.map((propLeaf) => decideRowByPropType(propLeaf))}
    </AnyCompositeRow>
  )
}

export default PropWithChildrenRow
