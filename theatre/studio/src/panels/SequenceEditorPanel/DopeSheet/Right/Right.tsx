import {theme} from '@theatre/studio/css'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import {darken} from 'polished'
import React from 'react'
import styled from 'styled-components'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import DopeSheetSelectionView from './DopeSheetSelectionView'
import HorizontallyScrollableArea from './HorizontallyScrollableArea'
import SheetRow from './SheetRow'

export const contentWidth = 1000000

const ListContainer = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute;
  left: 0;
  width: ${contentWidth}px;
`

const Background = styled.div<{width: number}>`
  position: absolute;
  top: 0;
  right: 0;
  width: ${(props) => props.width}px;
  bottom: 0;
  z-index: ${() => zIndexes.rightBackground};
  overflow: hidden;
  background: ${darken(1 * 0.03, theme.panel.bg)};
`

const Right: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  return usePrism(() => {
    const tree = val(layoutP.tree)
    const height =
      val(layoutP.tree.top) +
      Math.max(
        val(layoutP.tree.heightIncludingChildren),
        val(layoutP.dopeSheetDims.height),
      )

    return (
      <>
        <HorizontallyScrollableArea layoutP={layoutP} height={height}>
          <DopeSheetSelectionView layoutP={layoutP}>
            <ListContainer style={{top: tree.top + 'px'}}>
              <SheetRow leaf={tree} layoutP={layoutP} />
            </ListContainer>
          </DopeSheetSelectionView>
        </HorizontallyScrollableArea>
      </>
    )
  }, [layoutP])
}

export default Right
