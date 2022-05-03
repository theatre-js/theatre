import React from 'react'
import PanelResizeHandle from './PanelResizeHandle'

const PanelResizers: React.FC<{}> = (props) => {
  return (
    <>
      <PanelResizeHandle which="Bottom" />
      <PanelResizeHandle which="Top" />
      <PanelResizeHandle which="Left" />
      <PanelResizeHandle which="Right" />
      <PanelResizeHandle which="TopLeft" />
      <PanelResizeHandle which="TopRight" />
      <PanelResizeHandle which="BottomLeft" />
      <PanelResizeHandle which="BottomRight" />
    </>
  )
}

export default PanelResizers
