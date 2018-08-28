import React from 'react'
import PointClickArea from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointClickArea'
import PointCircle from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointCircle'

interface IProps {
  x: number
  y: number
  onClick: (evt: React.MouseEvent<SVGRectElement>) => any
  onContextMenu: (evt: React.MouseEvent<SVGRectElement>) => any
  dopesheet?: boolean
}

export default React.forwardRef(
  (
    {x, y, onClick, onContextMenu, dopesheet = false}: IProps,
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
          dopesheet={dopesheet}
        />
        <PointCircle x={x} y={y} />
      </>
    )
  },
)
