import React from 'react'
import {
  TColor,
  TNormalizedPoint,
  TPointHandles,
  TPointSingleHandle,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import BezierConnector from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/BezierConnector'
import PointCircle from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointCircle'
import {TPointMove} from '$tl/ui/panels/AllInOnePanel/Right/views/types'
import {isNumberTupleZero} from '$tl/ui/panels/AllInOnePanel/Right/utils'

interface IProps {
  color: TColor
  point: TNormalizedPoint
  nextPoint?: TNormalizedPoint
  prevPoint?: TNormalizedPoint
  pointMove: TPointMove
  handlesMove: TPointHandles
}

export default ({
  color,
  point,
  prevPoint,
  nextPoint,
  pointMove,
  handlesMove,
}: IProps) => {
  const pointTime = point.time - pointMove[0]
  const pointValue = point.value - pointMove[1]

  const ponintMoveIsNonZero = !isNumberTupleZero(pointMove)

  const renderPointConnector =
    point.interpolationDescriptor.connected &&
    nextPoint != null &&
    (ponintMoveIsNonZero ||
      !isNumberTupleZero(handlesMove.slice(2) as TPointSingleHandle))

  const renderPrevPointConnector =
    prevPoint != null &&
    prevPoint.interpolationDescriptor.connected &&
    (ponintMoveIsNonZero ||
      !isNumberTupleZero(handlesMove.slice(0, 2) as TPointSingleHandle))

  const pointHandles = [
    ...point.interpolationDescriptor.handles
      .slice(0, 2)
      .map((h, i) => h - handlesMove[i + 2]),
    ...point.interpolationDescriptor.handles.slice(2),
  ] as TPointHandles

  const prevPointHandles = renderPrevPointConnector
    ? ([
        ...prevPoint!.interpolationDescriptor.handles.slice(0, 2),
        ...prevPoint!.interpolationDescriptor.handles
          .slice(2)
          .map((h, i) => h - handlesMove[i]),
      ] as TPointHandles)
    : ([0, 0, 0, 0] as TPointHandles)

  return (
    <g fill={color.darkened} stroke={color.darkened}>
      {renderPointConnector && (
        <BezierConnector
          leftPointTime={pointTime}
          leftPointValue={pointValue}
          rightPointTime={nextPoint!.time}
          rightPointValue={nextPoint!.value}
          handles={pointHandles}
        />
      )}
      {renderPrevPointConnector && (
        <>
          <BezierConnector
            leftPointTime={prevPoint!.time}
            leftPointValue={prevPoint!.value}
            rightPointTime={pointTime}
            rightPointValue={pointValue}
            handles={prevPointHandles}
          />
          <g fill={color.normal} stroke={color.normal}>
            <PointCircle x={prevPoint!.time} y={prevPoint!.value} />
          </g>
        </>
      )}
      {ponintMoveIsNonZero && <PointCircle x={pointTime} y={pointValue} />}
    </g>
  )
}
