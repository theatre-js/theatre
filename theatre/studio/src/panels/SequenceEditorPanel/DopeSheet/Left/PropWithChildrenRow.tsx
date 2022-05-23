import type {
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import PrimitivePropRow from './PrimitivePropRow'
import {setCollapsedSheetObjectOrCompoundProp} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'

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
  return usePrism(() => {
    return (
      <AnyCompositeRow
        leaf={leaf}
        label={leaf.pathToProp[leaf.pathToProp.length - 1]}
        isCollapsed={leaf.isCollapsed}
        toggleCollapsed={() =>
          setCollapsedSheetObjectOrCompoundProp(!leaf.isCollapsed, leaf)
        }
      >
        {leaf.children.map((propLeaf) => decideRowByPropType(propLeaf))}
      </AnyCompositeRow>
    )
  }, [leaf])
}

export default PropWithChildrenRow
