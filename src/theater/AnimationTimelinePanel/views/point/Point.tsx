import React from 'react'
import PointClickArea from '$theater/AnimationTimelinePanel/views/point/PointClickArea'
import PointCircle from '$theater/AnimationTimelinePanel/views/point/PointCircle'

interface IProps {
  x: number
  y: number
  onClick: (evt: React.MouseEvent<SVGRectElement>) => any
  onContextMenu: (evt: React.MouseEvent<SVGRectElement>) => any
}

export default React.forwardRef((
  {x, y, onClick, onContextMenu}: IProps,
  ref: React.RefObject<SVGRectElement>,
) => {
  return (
    <>
      <PointClickArea
        x={x}
        y={y}
        onClick={onClick}
        onContextMenu={onContextMenu}
        forwardedRef={ref}
      />
      <PointCircle x={x} y={y} />
    </>
  )
})
