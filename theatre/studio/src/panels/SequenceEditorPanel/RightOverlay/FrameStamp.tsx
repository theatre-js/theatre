import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import mousePositionD from '@theatre/studio/utils/mousePositionD'
import {usePrism, useVal} from '@theatre/dataverse-react'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import {stampsGridTheme} from '@theatre/studio/panels/SequenceEditorPanel/FrameGrid/StampsGrid'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import {topStripTheme} from './TopStrip'
import {inRange} from 'lodash-es'
import {useFrameStampPosition} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'

const Label = styled.div`
  position: absolute;
  top: 16px;
  font-size: ${stampsGridTheme.stampFontSize};
  color: ${stampsGridTheme.fullUnitStampColor};
  text-align: center;
  transform: translateX(-50%);
  background: ${topStripTheme.backgroundColor};
  padding: 1px 8px;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  z-index: ${() => zIndexes.rightOverlay + 1};
`

const Line = styled.div`
  position: absolute;
  top: 5px;
  left: 0;
  bottom: 0;
  width: 1px;
  background: rgba(100, 100, 100, 0.2);
  pointer-events: none;
`

const FrameStamp: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = React.memo(({layoutP}) => {
  const posInUnitSpace = useVal(useFrameStampPosition().currentD)
  const unitSpaceToClippedSpace = useVal(layoutP.clippedSpace.fromUnitSpace)
  const {sequence, formatter, clippedSpaceWidth} = usePrism(() => {
    const sequence = val(layoutP.sheet).getSequence()
    const clippedSpaceWidth = val(layoutP.clippedSpace.width)
    return {sequence, formatter: sequence.positionFormatter, clippedSpaceWidth}
  }, [layoutP])

  if (posInUnitSpace == -1) {
    return <></>
  }

  const snappedPosInUnitSpace = sequence.closestGridPosition(posInUnitSpace)
  const posInClippedSpace = unitSpaceToClippedSpace(snappedPosInUnitSpace)

  const isVisible =
    posInClippedSpace >= 0 && posInClippedSpace <= clippedSpaceWidth

  return (
    <>
      <Label
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `translate3d(calc(${posInClippedSpace}px - 50%), 0, 0)`,
        }}
      >
        {formatter.formatForPlayhead(snappedPosInUnitSpace)}
      </Label>
      <Line
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `translate3d(${posInClippedSpace}px, 0, 0)`,
        }}
      />
    </>
  )
})

export default FrameStamp

/**
 *
 * @returns -1 if outside, otherwise, a positive number
 */
const usePointerPositionInUnitSpace = (
  layoutP: Pointer<SequenceEditorPanelLayout>,
): number => {
  return usePrism(() => {
    const rightDims = val(layoutP.rightDims)
    const clippedSpaceToUnitSpace = val(layoutP.clippedSpace.toUnitSpace)
    const leftPadding = val(layoutP.scaledSpace.leftPadding)

    const {clientX, clientY} = val(mousePositionD)

    const {screenX: x, screenY: y, width: rightWidth, height} = rightDims
    const bottomRectangleThingyDims = val(layoutP.bottomRectangleThingyDims)

    if (
      inRange(clientX, x, x + rightWidth) &&
      inRange(clientY, y, y + height) &&
      !inRange(
        clientY,
        bottomRectangleThingyDims.screenY,
        bottomRectangleThingyDims.screenY + bottomRectangleThingyDims.height,
      )
    ) {
      const posInRightDims = clientX - x
      const posInUnitSpace = clippedSpaceToUnitSpace(posInRightDims)

      return posInUnitSpace
    } else {
      return -1
    }
  }, [layoutP])
}
