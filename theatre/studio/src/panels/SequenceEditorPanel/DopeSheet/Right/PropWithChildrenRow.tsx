import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import React from 'react'
import PrimitivePropRow from './PrimitivePropRow'
import RightRow from './Row'
import {useSequenceEditorCollapsable} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/useSequenceEditorCollapsable'
import {createStudioSheetItemKey} from '@theatre/shared/utils/ids'

export const decideRowByPropType = (
  leaf: SequenceEditorTree_PropWithChildren | SequenceEditorTree_PrimitiveProp,
  layoutP: Pointer<SequenceEditorPanelLayout>,
): React.ReactElement =>
  leaf.type === 'propWithChildren' ? (
    <PropWithChildrenRow
      layoutP={layoutP}
      leaf={leaf}
      key={'prop' + leaf.pathToProp[leaf.pathToProp.length - 1]}
    />
  ) : (
    <PrimitivePropRow
      layoutP={layoutP}
      leaf={leaf}
      key={'prop' + leaf.pathToProp[leaf.pathToProp.length - 1]}
    />
  )

const PropWithChildrenRow: React.VFC<{
  leaf: SequenceEditorTree_PropWithChildren
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  const collapsable = useSequenceEditorCollapsable(
    createStudioSheetItemKey.forSheetObjectProp(
      leaf.sheetObject,
      leaf.pathToProp,
    ),
  )

  return usePrism(() => {
    const node = <div />

    return (
      <RightRow leaf={leaf} node={node} collapsable={collapsable}>
        {leaf.children.map((propLeaf) =>
          decideRowByPropType(propLeaf, layoutP),
        )}
      </RightRow>
    )
  }, [leaf, layoutP])
}
