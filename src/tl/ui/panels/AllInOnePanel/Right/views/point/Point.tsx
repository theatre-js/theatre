import React from 'react'
import PointClickArea from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointClickArea'
import PointCircle from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointCircle'
import noop from '$shared/utils/noop'

interface IProps {
  x: number
  y: number
  onClick: (evt: React.MouseEvent<SVGRectElement>) => void
  onContextMenu: (evt: React.MouseEvent<SVGRectElement>) => void
  onMouseMove?: (evt: React.MouseEvent<SVGRectElement>) => void
  onMouseLeave?: (evt: React.MouseEvent<SVGRectElement>) => void
  onMouseEnter?: (evt: React.MouseEvent<SVGRectElement>) => void
  dopesheet?: boolean
}

export default React.forwardRef(
  (
    {
      x,
      y,
      onClick,
      onContextMenu,
      onMouseMove = noop,
      onMouseLeave = noop,
      onMouseEnter = noop,
      dopesheet = false,
    }: IProps,
    ref: React.RefObject<SVGRectElement>,
  ) => {
    return (
      <>
        <PointClickArea
          x={x}
          y={y}
          onClick={onClick}
          onContextMenu={onContextMenu}
          onMouseMove={onMouseMove}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          forwardedRef={ref}
          dopesheet={dopesheet}
        />
        <PointCircle x={x} y={y} />
      </>
    )
  },
)
