import React from 'react'
import css from './PanelResizers.css'
import resolveCss from '$shared/utils/resolveCss'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import {IPanelMargins} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'

const classes = resolveCss(css)

interface IProps {
  onResize: (marginsDeltas: Partial<IPanelMargins>) => void
  onResizeEnd: () => void
}

interface IState {}

class PanelResizers extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <div {...classes('container')}>
        <DraggableArea
          shouldReturnMovement
          onDrag={(dx, dy) => this.props.onResize({left: dx, top: dy})}
          onDragEnd={() => this.props.onResizeEnd()}
          lockCursorTo="nwse-resize"
        >
          <div {...classes('nwse', 'top', 'left')} />
        </DraggableArea>
        <DraggableArea
          shouldReturnMovement
          onDrag={(_, dy) => this.props.onResize({top: dy})}
          onDragEnd={() => this.props.onResizeEnd()}
          lockCursorTo="ns-resize"
        >
          <div {...classes('ns', 'top')} />
        </DraggableArea>
        <DraggableArea
          shouldReturnMovement
          onDrag={(dx, dy) => this.props.onResize({right: dx, top: dy})}
          onDragEnd={() => this.props.onResizeEnd()}
          lockCursorTo="nesw-resize"
        >
          <div {...classes('nesw', 'top', 'right')} />
        </DraggableArea>
        <DraggableArea
          shouldReturnMovement
          onDrag={dx => this.props.onResize({left: dx})}
          onDragEnd={() => this.props.onResizeEnd()}
          lockCursorTo="ew-resize"
        >
          <div {...classes('ew', 'left')} />
        </DraggableArea>
        <DraggableArea
          shouldReturnMovement
          onDrag={dx => this.props.onResize({right: dx})}
          onDragEnd={() => this.props.onResizeEnd()}
          lockCursorTo="ew-resize"
        >
          <div {...classes('ew', 'right')} />
        </DraggableArea>
        <DraggableArea
          shouldReturnMovement
          onDrag={(dx, dy) => this.props.onResize({left: dx, bottom: dy})}
          onDragEnd={() => this.props.onResizeEnd()}
          lockCursorTo="nesw-resize"
        >
          <div {...classes('nesw', 'left', 'bottom')} />
        </DraggableArea>
        <DraggableArea
          shouldReturnMovement
          onDrag={(_, dy) => this.props.onResize({bottom: dy})}
          onDragEnd={() => this.props.onResizeEnd()}
          lockCursorTo="ns-resize"
        >
          <div {...classes('ns', 'bottom')} />
        </DraggableArea>
        <DraggableArea
          shouldReturnMovement
          onDrag={(dx, dy) => this.props.onResize({right: dx, bottom: dy})}
          onDragEnd={() => this.props.onResizeEnd()}
          lockCursorTo="nwse-resize"
        >
          <div {...classes('nwse', 'right', 'bottom')} />
        </DraggableArea>
      </div>
    )
  }
}

export default PanelResizers
