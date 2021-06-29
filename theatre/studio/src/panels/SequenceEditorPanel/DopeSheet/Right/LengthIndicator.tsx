import {usePrism} from '@theatre/dataverse-react'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'

const divWidth = 1000

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background: rgb(23 23 23 / 43%);
  width: ${divWidth}px;
  z-index: ${() => zIndexes.lengthIndicator};
  transform-origin: left top;
`

const LengthIndicator: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  return usePrism(() => {
    const sheet = val(layoutP.sheet)
    const height = val(layoutP.rightDims.height)

    const startInUnitSpace = sheet.getSequence().length

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
      scaleX = (endX - startX) / divWidth
    }

    return (
      <Container
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
      ></Container>
    )
  }, [layoutP])
}

export default LengthIndicator
