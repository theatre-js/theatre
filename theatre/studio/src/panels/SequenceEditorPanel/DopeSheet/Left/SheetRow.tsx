import type {SequenceEditorTree_Sheet} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/dataverse-react'
import React from 'react'
import styled from 'styled-components'
import SheetObjectRow from './SheetObjectRow'

const Container = styled.div``

const SheetRow: React.FC<{
  leaf: SequenceEditorTree_Sheet
}> = ({leaf}) => {
  return usePrism(() => {
    return (
      <>
        {leaf.children.map((sheetObjectLeaf) => (
          <SheetObjectRow
            key={'sheetObject-' + sheetObjectLeaf.sheetObject.address.objectKey}
            leaf={sheetObjectLeaf}
          />
        ))}
      </>
    )
  }, [leaf])
}

export default SheetRow
