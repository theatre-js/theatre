import {getOutlineSelection} from '@theatre/studio/selectors'
import {usePrism} from '@theatre/react'
import {valToAtom} from '@theatre/shared/utils/valToAtom'
import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'

import DopeSheet from './DopeSheet/DopeSheet'
import GraphEditor from './GraphEditor/GraphEditor'
import type {PanelDims, SequenceEditorPanelLayout} from './layout/layout'
import {sequenceEditorPanelLayout} from './layout/layout'
import RightOverlay from './RightOverlay/RightOverlay'
import BasePanel, {usePanel} from '@theatre/studio/panels/BasePanel/BasePanel'
import type {PanelPosition} from '@theatre/studio/store/types'
import PanelDragZone from '@theatre/studio/panels/BasePanel/PanelDragZone'
import PanelWrapper from '@theatre/studio/panels/BasePanel/PanelWrapper'
import FrameStampPositionProvider from './FrameStampPositionProvider'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type Sheet from '@theatre/core/sheets/Sheet'
import {isSheet, isSheetObject} from '@theatre/shared/instanceTypes'
import {uniq} from 'lodash-es'
import GraphEditorToggle from './GraphEditorToggle'
import {
  panelZIndexes,
  TitleBar,
  TitleBar_Piece,
  TitleBar_Punctuation,
} from '@theatre/studio/panels/BasePanel/common'
import type {UIPanelId} from '@theatre/shared/utils/ids'

const Container = styled(PanelWrapper)`
  z-index: ${panelZIndexes.sequenceEditorPanel};
  box-shadow: 2px 2px 0 rgb(0 0 0 / 11%);
`

const LeftBackground = styled.div`
  background-color: rgba(40, 43, 47, 0.99);
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: -1;
  pointer-events: none;
`

export const zIndexes = (() => {
  const s = {
    rightBackground: 0,
    scrollableArea: 0,
    rightOverlay: 0,
    lengthIndicatorCover: 0,
    lengthIndicatorStrip: 0,
    playhead: 0,
    currentFrameStamp: 0,
    marker: 0,
    horizontalScrollbar: 0,
  }

  // sort the z-indexes
  let i = -1
  for (const key of Object.keys(s)) {
    s[key] = i
    i++
  }

  return s
})()

const Header_Container = styled(PanelDragZone)`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
`

const defaultPosition: PanelPosition = {
  edges: {
    left: {from: 'screenLeft', distance: 0.1},
    right: {from: 'screenRight', distance: 0.2},
    top: {from: 'screenBottom', distance: 0.4},
    bottom: {from: 'screenBottom', distance: 0.01},
  },
}

const minDims = {width: 800, height: 200}

const SequenceEditorPanel: React.VFC<{}> = (props) => {
  return (
    <BasePanel
      panelId={'sequenceEditor' as UIPanelId}
      defaultPosition={defaultPosition}
      minDims={minDims}
    >
      <Content />
    </BasePanel>
  )
}

const Content: React.VFC<{}> = () => {
  const {dims} = usePanel()

  return usePrism(() => {
    const panelSize = prism.memo(
      'panelSize',
      (): PanelDims => {
        const width = dims.width
        const height = dims.height
        return {
          width: width,
          height: height,

          widthWithoutBorder: width - 2,
          heightWithoutBorder: height - 4,

          screenX: dims.left,
          screenY: dims.top,
        }
      },
      [dims],
    )

    const selectedSheets = uniq(
      getOutlineSelection()
        .filter((s): s is SheetObject | Sheet => isSheet(s) || isSheetObject(s))
        .map((s) => (isSheetObject(s) ? s.sheet : s)),
    )
    const selectedTemplates = uniq(selectedSheets.map((s) => s.template))

    if (selectedTemplates.length !== 1) return <></>
    const sheet = selectedSheets[0]

    if (!sheet) return <></>

    const panelSizeP = valToAtom('panelSizeP', panelSize).pointer

    // We make a unique key based on the sheet's address, so that
    // <Left /> and <Right />
    // don't have to listen to changes in sheet
    const key = prism.memo('key', () => JSON.stringify(sheet.address), [sheet])

    const layoutP = prism
      .memo(
        'layout',
        () => {
          return sequenceEditorPanelLayout(sheet, panelSizeP)
        },
        [sheet, panelSizeP],
      )
      .getValue()

    if (val(layoutP.tree.children).length === 0) return <></>

    const containerRef = prism.memo(
      'containerRef',
      preventHorizontalWheelEvents,
      [],
    )

    const graphEditorAvailable = val(layoutP.graphEditorDims.isAvailable)
    const graphEditorOpen = val(layoutP.graphEditorDims.isOpen)

    return (
      <Container ref={containerRef}>
        <LeftBackground style={{width: `${val(layoutP.leftDims.width)}px`}} />
        <FrameStampPositionProvider layoutP={layoutP}>
          <Header layoutP={layoutP} />
          <DopeSheet key={key + '-dopeSheet'} layoutP={layoutP} />
          {graphEditorOpen && (
            <GraphEditor key={key + '-graphEditor'} layoutP={layoutP} />
          )}
          {graphEditorAvailable && <GraphEditorToggle layoutP={layoutP} />}
          <RightOverlay layoutP={layoutP} />
        </FrameStampPositionProvider>
      </Container>
    )
  }, [dims])
}

const Header: React.FC<{layoutP: Pointer<SequenceEditorPanelLayout>}> = ({
  layoutP,
}) => {
  return usePrism(() => {
    const sheet = val(layoutP.sheet)
    return (
      <Header_Container
        style={{
          width: val(layoutP.leftDims.width),
        }}
      >
        <TitleBar>
          <TitleBar_Piece>{sheet.address.sheetId} </TitleBar_Piece>

          <TitleBar_Punctuation>{':'}&nbsp;</TitleBar_Punctuation>
          <TitleBar_Piece>{sheet.address.sheetInstanceId} </TitleBar_Piece>

          <TitleBar_Punctuation>&nbsp;{'>'}&nbsp;</TitleBar_Punctuation>
          <TitleBar_Piece>Sequence</TitleBar_Piece>
        </TitleBar>
      </Header_Container>
    )
  }, [layoutP])
}

export default SequenceEditorPanel

const preventHorizontalWheelEvents = () => {
  let lastNode: null | HTMLElement = null
  const listenerOptions = {
    passive: false,
    capture: false,
  }

  const receiveWheelEvent = (event: WheelEvent) => {
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (node: HTMLElement | null) => {
    if (lastNode !== node && lastNode) {
      lastNode.removeEventListener('wheel', receiveWheelEvent, listenerOptions)
    }
    lastNode = node
    if (node) {
      node.addEventListener('wheel', receiveWheelEvent, listenerOptions)
    }
  }
}
