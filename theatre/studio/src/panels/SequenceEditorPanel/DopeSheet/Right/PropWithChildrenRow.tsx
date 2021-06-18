import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/shared/utils/reactDataverse'
import type {Pointer} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import PrimitivePropRow from './PrimitivePropRow'
import Row from './Row'

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

const Container = styled.div``

const PropWithChildrenRow: React.FC<{
  leaf: SequenceEditorTree_PropWithChildren
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return usePrism(() => {
    const node = <div />

    return (
      <Row leaf={leaf} node={node}>
        {leaf.children.map((propLeaf) =>
          decideRowByPropType(propLeaf, layoutP),
        )}
      </Row>
    )
  }, [leaf, layoutP])
}

export default PropWithChildrenRow
