import type {
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import PrimitivePropRow from './PrimitivePropRow'
import {useSequenceEditorCollapsable} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/useSequenceEditorCollapsable'
import {createStudioSheetItemKey} from '@theatre/shared/utils/ids'

export const decideRowByPropType = (
  leaf: SequenceEditorTree_PropWithChildren | SequenceEditorTree_PrimitiveProp,
): React.ReactElement =>
  leaf.type === 'propWithChildren' ? (
    <PropWithChildrenRow
      leaf={leaf}
      key={'prop' + leaf.pathToProp[leaf.pathToProp.length - 1]}
    />
  ) : (
    <PrimitivePropRow
      leaf={leaf}
      key={'prop' + leaf.pathToProp[leaf.pathToProp.length - 1]}
    />
  )

const PropWithChildrenRow: React.VFC<{
  leaf: SequenceEditorTree_PropWithChildren
}> = ({leaf}) => {
  const collapsable = useSequenceEditorCollapsable(
    createStudioSheetItemKey.forSheetObjectProp(
      leaf.sheetObject,
      leaf.pathToProp,
    ),
  )

  return usePrism(() => {
    return (
      <AnyCompositeRow
        leaf={leaf}
        label={leaf.pathToProp[leaf.pathToProp.length - 1]}
        collapsable={collapsable}
      >
        {leaf.children.map((propLeaf) => decideRowByPropType(propLeaf))}
      </AnyCompositeRow>
    )
  }, [leaf])
}

export default PropWithChildrenRow
