import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {usePrism} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {topStripHeight} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/TopStrip'
import React, {useMemo} from 'react'
import styled from 'styled-components'

const focusRangeAreaTheme = {
  enabled: {
    backgroundColor: '#646568',
    opacity: 0.05,
  },
  disabled: {
    backgroundColor: '#646568',
  },
}

const divWidth = 1000

const Container = styled.div`
  position: absolute;
  opacity: ${focusRangeAreaTheme.enabled.opacity};
  background: transparent;
  left: 0;
  top: 0;
  width: ${divWidth}px;
  transform-origin: top left;
`
const FocusRangeArea: React.FC<{
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

    const range = existingRange?.range || {start: 0, end: 0}

    const height = val(layoutP.rightDims.height) + topStripHeight

    let startPosInClippedSpace: number,
      endPosInClippedSpace: number,
      conditionalStyleProps:
        | {
            transform: string
            background?: string
          }
        | undefined

    if (existingRange !== undefined) {
      startPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(
        range.start,
      )

      endPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(range.end)

      const desiredWidth = endPosInClippedSpace - startPosInClippedSpace

      conditionalStyleProps = {
        transform: `translateX(${
          val(layoutP.scaledSpace.leftPadding) +
          startPosInClippedSpace -
          val(layoutP.clippedSpace.fromUnitSpace)(0)
        }px) scaleX(${desiredWidth / divWidth})`,
      }

      if (existingRange.enabled === true) {
        conditionalStyleProps.background =
          focusRangeAreaTheme.enabled.backgroundColor
      }
    }

    return (
      <Container style={{...conditionalStyleProps, height: `${height}px`}} />
    )
  }, [layoutP, existingRangeD])
}

export default FocusRangeArea
