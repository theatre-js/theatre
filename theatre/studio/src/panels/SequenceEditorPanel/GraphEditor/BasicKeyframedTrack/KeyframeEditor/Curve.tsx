import {valueInProp} from '@theatre/shared/propTypes/utils'
import getStudio from '@theatre/studio/getStudio'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import React from 'react'
import styled from 'styled-components'
import type KeyframeEditor from './KeyframeEditor'

const SVGPath = styled.path`
  stroke-width: 2;
  stroke: var(--main-color);
  fill: none;
  vector-effect: non-scaling-stroke;
`

type IProps = Parameters<typeof KeyframeEditor>[0]

const Curve: React.VFC<IProps> = (props) => {
  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  const connectorLengthInUnitSpace = next.position - cur.position

  const [nodeRef, node] = useRefAndState<SVGPathElement | null>(null)

  const [contextMenu] = useConnectorContextMenu(node, props)

  const curValue = props.isScalar
    ? (valueInProp(cur.value, props.propConfig) as number)
    : 0
  const nextValue = props.isScalar
    ? (valueInProp(next.value, props.propConfig) as number)
    : 1
  const leftYInExtremumSpace = props.extremumSpace.fromValueSpace(curValue)
  const rightYInExtremumSpace = props.extremumSpace.fromValueSpace(nextValue)

  const heightInExtremumSpace = rightYInExtremumSpace - leftYInExtremumSpace

  const transform = transformBox(
    cur.position,
    leftYInExtremumSpace,
    connectorLengthInUnitSpace,
    heightInExtremumSpace,
  )

  const x1 = cur.handles[2]
  const y1 = cur.handles[3]

  const x2 = next.handles[0]
  const y2 = next.handles[1]

  const pathD = `M 0 0 C ${x1} ${y1} ${x2} ${y2} 1 1`

  return (
    <>
      <SVGPath
        ref={nodeRef}
        d={pathD}
        style={{
          transform,
        }}
      />

      {contextMenu}
    </>
  )
}

/**
 * Assuming a box such that: `{x: 0, y: 0, width: 1px, height: 1px}`
 * and given the desired coordinates of:
 * `{x: xInUnitSpace, y: yInExtremumSpace, width: widthInUnitSpace, height: heightInExtremumSpace}`,
 * `transformBox()` returns a CSS transform that transforms the box into its right dimensions
 * in the GraphEditor space.
 */
export function transformBox(
  xInUnitSpace: number,
  yInExtremumSpace: number,
  widthInUnitSpace: number,
  heightInExtremumSpace: number,
): string {
  const translateX = `calc(var(--unitSpaceToScaledSpaceMultiplier) * ${xInUnitSpace}px)`

  const translateY = `calc((var(--graphEditorVerticalSpace) - var(--graphEditorVerticalSpace) * ${yInExtremumSpace}) * 1px)`

  if (widthInUnitSpace === 0) {
    widthInUnitSpace = 0.0001
  }

  const scaleX = `calc(var(--unitSpaceToScaledSpaceMultiplier) * ${widthInUnitSpace})`

  if (heightInExtremumSpace === 0) {
    heightInExtremumSpace = 0.001
  }

  const scaleY = `calc(var(--graphEditorVerticalSpace) * ${
    heightInExtremumSpace * -1
  })`

  return `translate(${translateX}, ${translateY}) scale(${scaleX}, ${scaleY})`
}

export default Curve

function useConnectorContextMenu(node: SVGElement | null, props: IProps) {
  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  return useContextMenu(node, {
    menuItems: () => {
      return [
        {
          label: 'Delete',
          callback: () => {
            getStudio()!.transaction(({stateEditors}) => {
              const {deleteKeyframes} =
                stateEditors.coreByProject.historic.sheetsById.sequence

              deleteKeyframes({
                ...props.sheetObject.address,
                trackId: props.trackId,
                keyframeIds: [cur.id, next.id],
              })
            })
          },
        },
      ]
    },
  })
}
