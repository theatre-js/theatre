import type {
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import React from 'react'
import styled from 'styled-components'
import AnyCompositeRow from './AnyCompositeRow'
import PrimitivePropRow from './PrimitivePropRow'

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

const Container = styled.div``

const PropWithChildrenRow: React.FC<{
  leaf: SequenceEditorTree_PropWithChildren
}> = ({leaf}) => {
  return usePrism(() => {
    return (
      <AnyCompositeRow
        leaf={leaf}
        label={leaf.pathToProp[leaf.pathToProp.length - 1]}
      >
        {leaf.children.map((propLeaf) => decideRowByPropType(propLeaf))}
      </AnyCompositeRow>
    )
  }, [leaf])
}

export default PropWithChildrenRow
