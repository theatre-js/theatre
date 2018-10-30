import React from 'react'
import * as css from './EditOverlay.css'
import cx from 'classnames'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'

export type SizeChanges = Partial<{
  left: number
  right: number
  bottom: number
  top: number
}>

interface IProps {
  onMove: (dx: number, dy: number) => void
  onMoveEnd: () => void
  onResize: (changes: SizeChanges) => void
  onResizeEnd: () => void
}
interface IState {}

class EditOverlay extends React.Component<IProps, IState> {
  shouldComponentUpdate() {
    return false
  }

  render() {
    return (
      <div
        className={cx(css.container, {
          // [css.isPanelHeaderLess]: this.props.isPanelHeaderLess,
        })}
      >
        <DraggableArea
          onDrag={(dx, dy) => this.props.onResize({left: dx, top: dy})}
          onDragEnd={() => this.props.onResizeEnd()}
        >
          <div style={{cursor: 'nwse-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={(_, dy) => this.props.onResize({top: dy})}
          onDragEnd={() => this.props.onResizeEnd()}
        >
          <div style={{cursor: 'ns-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={(dx, dy) => this.props.onResize({right: dx, top: dy})}
          onDragEnd={() => this.props.onResizeEnd()}
        >
          <div style={{cursor: 'nesw-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={dx => this.props.onResize({left: dx})}
          onDragEnd={() => this.props.onResizeEnd()}
        >
          <div style={{cursor: 'ew-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={(dx, dy) => this.props.onMove(dx, dy)}
          onDragEnd={() => this.props.onMoveEnd()}
        >
          <div style={{cursor: 'move'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={dx => this.props.onResize({right: dx})}
          onDragEnd={() => this.props.onResizeEnd()}
        >
          <div style={{cursor: 'ew-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={(dx, dy) => this.props.onResize({left: dx, bottom: dy})}
          onDragEnd={() => this.props.onResizeEnd()}
        >
          <div style={{cursor: 'nesw-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={(_, dy) => this.props.onResize({bottom: dy})}
          onDragEnd={() => this.props.onResizeEnd()}
        >
          <div style={{cursor: 'ns-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={(dx, dy) => this.props.onResize({right: dx, bottom: dy})}
          onDragEnd={() => this.props.onResizeEnd()}
        >
          <div style={{cursor: 'nwse-resize'}} />
        </DraggableArea>
      </div>
    )
  }
}

export default EditOverlay
