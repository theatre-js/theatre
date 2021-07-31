import {usePrism} from '@theatre/dataverse-react'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import {topStripHeight} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/TopStrip'

const coverWidth = 1000

const Cover = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgb(23 23 23 / 43%);
  width: ${coverWidth}px;
  z-index: ${() => zIndexes.lengthIndicatorCover};
  transform-origin: left top;
`

const Strip = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  z-index: ${() => zIndexes.lengthIndicatorStrip};
  pointer-events: auto;
  cursor: pointer;

  &:after {
    display: block;
    content: ' ';
    position: absolute;
    top: ${topStripHeight}px;
    bottom: 0;
    left: -1px;
    width: 1px;
    background-color: #000000a6;
  }

  &:hover:after {
    background-color: #000000;
  }
`

const Info = styled.div`
  position: absolute;
  top: ${topStripHeight + 4}px;
  font-size: 10px;
  left: 4px;
  color: gray;
  white-space: nowrap;
  display: none;

  ${Strip}:hover & {
    display: block;
  }
`

const LengthIndicator: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  return usePrism(() => {
    const sheet = val(layoutP.sheet)
    const height = val(layoutP.rightDims.height)

    const sequenceLength = sheet.getSequence().length
    const startInUnitSpace = sequenceLength

    let startX = val(layoutP.clippedSpace.fromUnitSpace)(startInUnitSpace)
    let endX = val(layoutP.clippedSpace.width)
    let scaleX: number, translateX: number
    if (startX > endX) {
      translateX = 0
      scaleX = 0
    } else {
      if (startX < 0) {
        startX = 0
      }
      translateX = startX
      scaleX = (endX - startX) / coverWidth
    }

    return (
      <>
        <Strip
          title="Change Sequence Length"
          style={{
            height: height + 'px',
            transform: `translateX(${translateX === 0 ? -1000 : translateX}px)`,
          }}
        >
          <Info>Sequence Length: {sequenceLength}</Info>
        </Strip>
        <Cover
          title="Length"
          // onClick={() => {
          //   getStudio()!.transaction(({stateEditors}) => {
          //     stateEditors.coreByProject.historic.sheetsById.sequence.setLength({
          //       ...sheet.address,
          //       length: 10,
          //     })
          //   })
          // }}
          style={{
            height: height + 'px',
            transform: `translateX(${translateX}px) scale(${scaleX}, 1)`,
          }}
        />
      </>
    )
  }, [layoutP])
}

export default LengthIndicator
