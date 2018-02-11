import {React} from '$studio/handy'
import css from './EditOverlay.css'
import cx from 'classnames'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'

type Props = any
type State = any

class EditOverlay extends React.PureComponent<Props, State> {
  render() {
    return (
      <div
        className={cx(css.container, {
          [css.isPanelHeaderLess]: this.props.isPanelHeaderLess,
        })}
      >
        <DraggableArea
          onDrag={(dx, dy) => this.props.onBoundaryDrag({left: dx, top: dy})}
          onDragEnd={() => this.props.onBoundaryDragEnd()}
        >
          <div style={{cursor: 'nwse-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={(_, dy) => this.props.onBoundaryDrag({top: dy})}
          onDragEnd={() => this.props.onBoundaryDragEnd()}
        >
          <div style={{cursor: 'ns-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={(dx, dy) => this.props.onBoundaryDrag({right: dx, top: dy})}
          onDragEnd={() => this.props.onBoundaryDragEnd()}
        >
          <div style={{cursor: 'nesw-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={dx => this.props.onBoundaryDrag({left: dx})}
          onDragEnd={() => this.props.onBoundaryDragEnd()}
        >
          <div style={{cursor: 'ew-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={(dx, dy) => this.props.onPanelDrag(dx, dy)}
          onDragEnd={() => this.props.onPanelDragEnd()}
        >
          <div style={{cursor: 'move'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={dx => this.props.onBoundaryDrag({right: dx})}
          onDragEnd={() => this.props.onBoundaryDragEnd()}
        >
          <div style={{cursor: 'ew-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={(dx, dy) => this.props.onBoundaryDrag({left: dx, bottom: dy})}
          onDragEnd={() => this.props.onBoundaryDragEnd()}
        >
          <div style={{cursor: 'nesw-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={(_, dy) => this.props.onBoundaryDrag({bottom: dy})}
          onDragEnd={() => this.props.onBoundaryDragEnd()}
        >
          <div style={{cursor: 'ns-resize'}} />
        </DraggableArea>
        <DraggableArea
          onDrag={(dx, dy) =>
            this.props.onBoundaryDrag({right: dx, bottom: dy})
          }
          onDragEnd={() => this.props.onBoundaryDragEnd()}
        >
          <div style={{cursor: 'nwse-resize'}} />
        </DraggableArea>
      </div>
    )
  }
}

export default EditOverlay
