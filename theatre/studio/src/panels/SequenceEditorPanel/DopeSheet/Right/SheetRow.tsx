import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_Sheet} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/dataverse-react'
import type {Pointer} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import SheetObjectRow from './SheetObjectRow'

const Container = styled.div``

const SheetRow: React.FC<{
  leaf: SequenceEditorTree_Sheet
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return usePrism(() => {
    const node = <div />

    return (
      <>
        {leaf.children.map((sheetObjectLeaf) => (
          <SheetObjectRow
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
