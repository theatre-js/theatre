import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {usePrism} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {topStripHeight} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/TopStrip'
import React, {useMemo} from 'react'
import styled from 'styled-components'

const divWidth = 1000

const Curtain = styled.div<{enabled: boolean}>`
  position: absolute;
  left: 0;
  opacity: 0.15;
  top: ${topStripHeight}px;
  width: ${divWidth}px;
  transform-origin: top left;
  z-index: 20;
  pointer-events: none;
  background-color: ${(props) => (props.enabled ? '#000000' : 'transparent')};
`

const FocusRangeCurtains: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  const existingRangeD = useMemo(
    () =>
      prism(() => {
        const {projectId, sheetId} = val(layoutP.sheet).address
        const existingRange = val(
          getStudio().atomP.ahistoric.projects.stateByProjectId[projectId]
            .stateBySheetId[sheetId].sequence.focusRange,
        )
        return existingRange
      }),
    [layoutP],
  )

  return usePrism(() => {
    const existingRange = existingRangeD.getValue()

    if (!existingRange || !existingRange.enabled) return null

    const {range} = existingRange

    const height = val(layoutP.rightDims.height)

    const unitSpaceToClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)

    const els = [
      [-1000, range.start],
      [range.end, val(layoutP.clippedSpace.range.end)],
    ].map(([start, end], i) => {
      const startPosInClippedSpace = unitSpaceToClippedSpace(start)

      const endPosInClippedSpace = unitSpaceToClippedSpace(end)
      const desiredWidth = endPosInClippedSpace - startPosInClippedSpace

      return (
        <Curtain
          key={`curtain-${i}`}
          enabled={true}
          style={{
            height: `${height}px`,
            transform: `translateX(${
              val(layoutP.scaledSpace.leftPadding) +
              startPosInClippedSpace -
              unitSpaceToClippedSpace(0)
            }px) scaleX(${desiredWidth / divWidth})`,
          }}
        />
      )
    })

    return <>{els}</>
  }, [layoutP, existingRangeD])
}

export default FocusRangeCurtains
