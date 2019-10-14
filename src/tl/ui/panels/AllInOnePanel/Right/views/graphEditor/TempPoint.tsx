import React from 'react'
import {
  IColorAccent,
  INormalizedPoint,
  IPointHandles,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import BezierConnector from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/BezierConnector'
import PointCircle from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointCircle'

interface IProps {
  color: IColorAccent
  point: INormalizedPoint
  nextPoint?: INormalizedPoint
  prevPoint?: INormalizedPoint
}

export default ({
  color,
  point,
  prevPoint,
  nextPoint,
}: // pointMove,
// handlesMove,
IProps) => {
  const pointTime = point.time
  const pointValue = point.value

  const ponintMoveIsNonZero = true //!isNumberTupleZero(pointMove)

  const renderPointConnector =
    point.interpolationDescriptor.connected && nextPoint != null && true
  // (ponintMoveIsNonZero ||
  // !isNumberTupleZero(handlesMove.slice(2) as IPointSingleHandle))

  const renderPrevPointConnector =
    prevPoint != null && prevPoint.interpolationDescriptor.connected && true
  // (ponintMoveIsNonZero ||
  //   !isNumberTupleZero(handlesMove.slice(0, 2) as IPointSingleHandle))

  const pointHandles = [
    ...point.interpolationDescriptor.handles.slice(0, 2),
    // .map((h, i) => h - handlesMove[i + 2]),
    ...point.interpolationDescriptor.handles.slice(2),
  ] as IPointHandles

  const prevPointHandles = renderPrevPointConnector
    ? ([
        ...prevPoint!.interpolationDescriptor.handles.slice(0, 2),
        ...prevPoint!.interpolationDescriptor.handles.slice(2),
        // .map((h, i) => h - handlesMove[i]),
      ] as IPointHandles)
    : ([0, 0, 0, 0] as IPointHandles)

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
