import {getOutlineSelection} from '@theatre/studio/selectors'
import {usePrism} from '@theatre/dataverse-react'
import {valToAtom} from '@theatre/shared/utils/valToAtom'
import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import {
  TitleBar_Piece,
  TitleBar_Punctuation,
} from '@theatre/studio/panels/ObjectEditorPanel/ObjectEditorPanel'
import DopeSheet from './DopeSheet/DopeSheet'
import GraphEditor from './GraphEditor/GraphEditor'
import type {PanelDims, SequenceEditorPanelLayout} from './layout/layout'
import {sequenceEditorPanelLayout} from './layout/layout'
import RightOverlay from './RightOverlay/RightOverlay'
import BottomRectangleThingy from './BottomRectangleThingy/BottomRectangleThingy'
import BasePanel, {usePanel} from '@theatre/studio/panels/BasePanel/BasePanel'
import type {PanelPosition} from '@theatre/studio/store/types'
import PanelDragZone from '@theatre/studio/panels/BasePanel/PanelDragZone'
import PanelWrapper from '@theatre/studio/panels/BasePanel/PanelWrapper'
import FrameStampPositionProvider from './FrameStampPositionProvider'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type Sheet from '@theatre/core/sheets/Sheet'
import {isSheet, isSheetObject} from '@theatre/shared/instanceTypes'
import {uniq} from 'lodash-es'

const Container = styled(PanelWrapper)``

export const titleBarHeight = 20

const TitleBar = styled.div`
  height: ${titleBarHeight}px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: #adadadb3;
  border-bottom: 1px solid rgb(0 0 0 / 13%);
  background: #00000017;
  font-size: 10px;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

export const zIndexes = (() => {
  const scrollableArea = 0
  const rightOverlay = scrollableArea + 1
  const rightBackground = scrollableArea - 1
  const seeker = rightOverlay + 1
  const currentFrameStamp = seeker + 1
  const lengthIndicator = currentFrameStamp + 1
  const horizontalScrollbar = lengthIndicator + 1
  const bottomRectangleThingy = horizontalScrollbar + 1

  return {
    scrollableArea,
    rightOverlay,
    rightBackground,
    seeker,
    horizontalScrollbar,
    currentFrameStamp,
    lengthIndicator,
    bottomRectangleThingy,
  }
})()

const Header_Container = styled(PanelDragZone)`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
`

/**
 * @todo Add a message here
 */
const EmptyPanel: React.FC<{width: number; height: number}> = (props) => (
  <Container {...props} />
)

const defaultPosition: PanelPosition = {
  edges: {
    left: {from: 'screenLeft', distance: 0.1},
    right: {from: 'screenRight', distance: 0.2},
    top: {from: 'screenBottom', distance: 0.4},
    bottom: {from: 'screenBottom', distance: 0.01},
  },
}

const minDims = {width: 800, height: 200}

const SequenceEditorPanel: React.FC<{}> = (props) => {
  return (
    <BasePanel
      panelId="sequenceEditor"
      defaultPosition={defaultPosition}
      minDims={minDims}
    >
      <Content />
    </BasePanel>
  )
}

const Content: React.FC<{}> = () => {
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

    if (selectedTemplates.length !== 1) return <EmptyPanel {...panelSize} />
    const sheet = selectedSheets[0]

    if (!sheet) return <EmptyPanel {...panelSize} />

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

    const containerRef = prism.memo(
      'containerRef',
      preventHorizontalWheelEvents,
      [],
    )

    const graphEditorOpen = val(layoutP.graphEditorDims.isOpen)
    return (
      <Container ref={containerRef}>
        <FrameStampPositionProvider layoutP={layoutP}>
          <Header layoutP={layoutP} />
          <DopeSheet key={key + '-dopeSheet'} layoutP={layoutP} />
          <BottomRectangleThingy layoutP={layoutP} />
          {graphEditorOpen && (
            <GraphEditor key={key + '-graphEditor'} layoutP={layoutP} />
          )}
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
