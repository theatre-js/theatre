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
  top: ${topStripHeight}px;
  left: 0;
  opacity: 0.15;
  width: ${divWidth}px;
  transform-origin: top left;
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

    const height = val(layoutP.rightDims.height) - topStripHeight

    const unitSpaceToClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)
    const clippedSpaceWidth = val(layoutP.clippedSpace.width)

    const els: Array<{translateX: number; scaleX: number}> = []

    {
      // the left (start) curtain
      // starts from 0px
      let startX = 0
      // ends in the start of the range
      let endX = unitSpaceToClippedSpace(existingRange.range.start)
      let scaleX: number, translateX: number
      // hide the curtain if:
      if (
        // endX would be larger than startX, which means the curtain is to the left of the RightOverlay
        startX > endX
      ) {
        // fully hide it then with scaleX = 0
        translateX = 0
        scaleX = 0
      } else {
        // clip the end of the curtain if it's going over the right side of RightOverlay
        if (endX > clippedSpaceWidth) {
          //
          endX = clippedSpaceWidth
        }
        translateX = startX
        scaleX = (endX - startX) / divWidth
      }

      els.push({translateX, scaleX})
    }

    {
      // the right (end) curtain
      // starts at the end of the range
      let startX = unitSpaceToClippedSpace(existingRange.range.end)
      // and ends at the right edge of RightOverlay (which is clippedSpaceWidth)
      let endX = clippedSpaceWidth
      let scaleX: number, translateX: number
      // if the whole curtain falls to the right of RightOverlay, hide it
      if (startX > endX) {
        translateX = 0
        scaleX = 0
      } else {
        // if the left of the curtain falls on the left of RightOverlay, clip it
        if (startX < 0) {
          startX = 0
        }
        translateX = startX
        scaleX = (endX - startX) / divWidth
      }

      els.push({translateX, scaleX})
    }

    return (
      <>
        {els.map(({translateX, scaleX}, i) => (
          <Curtain
            key={`curtain-${i}`}
            enabled={true}
            style={{
              height: `${height}px`,
              transform: `translateX(${translateX}px) scaleX(${scaleX})`,
            }}
          />
        ))}
      </>
    )
  }, [layoutP, existingRangeD])
}

export default FocusRangeCurtains
