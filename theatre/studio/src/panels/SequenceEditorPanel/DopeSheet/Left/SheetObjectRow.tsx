import type {SequenceEditorTree_SheetObject} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/shared/utils/reactDataverse'
import React from 'react'
import styled from 'styled-components'
import CompoundRow from './AnyCompositeRow'
import {decideRowByPropType} from './PropWithChildrenRow'

const Container = styled.div``

const SheetObjectRow: React.FC<{
  leaf: SequenceEditorTree_SheetObject
}> = ({leaf}) => {
  return usePrism(() => {
    return (
      <CompoundRow leaf={leaf} label={leaf.sheetObject.address.objectKey}>
        {leaf.children.map((leaf) => decideRowByPropType(leaf))}
      </CompoundRow>
    )
  }, [leaf])
}

export default SheetObjectRow
