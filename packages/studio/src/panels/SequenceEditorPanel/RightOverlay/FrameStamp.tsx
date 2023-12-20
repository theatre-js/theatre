import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {usePrism, useVal} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import {stampsGridTheme} from '@theatre/studio/panels/SequenceEditorPanel/FrameGrid/StampsGrid'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import {topStripTheme} from './TopStrip'
import {
  FrameStampPositionType,
  useFrameStampPositionD,
} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  margin-top: 0px;
`

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
  z-index: ${() => zIndexes.currentFrameStamp};
`

const Line = styled.div<{posType: FrameStampPositionType}>`
  position: absolute;
  top: 5px;
  left: -0px;
  bottom: 0;
  width: 0.5px;
  background: rgba(100, 100, 100, 0.2);
  pointer-events: none;
`

const FrameStamp: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = React.memo(({layoutP}) => {
  const [posInUnitSpace, posType] = useVal(useFrameStampPositionD())
  const unitSpaceToClippedSpace = useVal(layoutP.clippedSpace.fromUnitSpace)
  const {sequence, formatter, clippedSpaceWidth} = usePrism(() => {
    const sequence = val(layoutP.sheet).getSequence()
    const clippedSpaceWidth = val(layoutP.clippedSpace.width)
    return {sequence, formatter: sequence.positionFormatter, clippedSpaceWidth}
  }, [layoutP])

  if (posInUnitSpace == -1) {
    return <></>
  }

  const snappedPosInUnitSpace =
    posType === FrameStampPositionType.free
      ? sequence.closestGridPosition(posInUnitSpace)
      : posInUnitSpace

  const posInClippedSpace = unitSpaceToClippedSpace(snappedPosInUnitSpace)

  const isVisible =
    posInClippedSpace >= 0 && posInClippedSpace <= clippedSpaceWidth

  return (
    <>
      <Container>
        <Label
          style={{
            opacity: isVisible ? 1 : 0,
            transform: `translate3d(calc(${posInClippedSpace}px - 50%), 0, 0)`,
          }}
        >
          {formatter.formatForPlayhead(snappedPosInUnitSpace)}
        </Label>
        <Line
          posType={posType}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: `translate3d(${posInClippedSpace}px, 0, 0)`,
          }}
        />
      </Container>{' '}
    </>
  )
})

export default FrameStamp
