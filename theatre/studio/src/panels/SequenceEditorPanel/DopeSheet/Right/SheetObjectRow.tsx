import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_SheetObject} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import {decideRowByPropType} from './PropWithChildrenRow'
import Row from './Row'

const Container = styled.div``

const SheetObjectRow: React.FC<{
  leaf: SequenceEditorTree_SheetObject
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return usePrism(() => {
    const node = <div />
    return (
      <Row leaf={leaf} node={node}>
        {leaf.children.map((leaf) => decideRowByPropType(leaf, layoutP))}
      </Row>
    )
  }, [leaf, layoutP])
}

export default SheetObjectRow
