import React from 'react'
import styled from 'styled-components'
import type KeyframeEditor from './KeyframeEditor'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {transformBox} from './Curve'

export const dotSize = 6

const SVGPath = styled.path`
  stroke-width: 2;
  stroke: var(--main-color);
  stroke-dasharray: 3 2;
  fill: none;
  vector-effect: non-scaling-stroke;
  opacity: 0.3;
`

type IProps = Parameters<typeof KeyframeEditor>[0]

const GraphEditorNonScalarDash: React.VFC<IProps> = (props) => {
  const {index, trackData} = props

  const pathD = `M 0 0 L 1 1`

  const transform = transformBox(
    trackData.keyframes[index].position,
    props.extremumSpace.fromValueSpace(0),
    0,
    props.extremumSpace.fromValueSpace(1) -
      props.extremumSpace.fromValueSpace(0),
  )

  return (
    <>
      <SVGPath
        d={pathD}
        style={{
          transform,
        }}
      />
    </>
  )
}

export default GraphEditorNonScalarDash
