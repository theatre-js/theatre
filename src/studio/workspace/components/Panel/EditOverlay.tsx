import {React} from '$studio/handy'
import css from './EditOverlay.css'
import DraggableArea from '$studio/common/components/DraggableArea'

type Props = any
type State = any

class EditOverlay extends React.PureComponent<Props, State> {
  render() {
    return (
      <div className={css.container}>
        <div style={{cursor: 'nwse-resize'}} />
        <div style={{cursor: 'ns-resize'}} />
        <div style={{cursor: 'nesw-resize'}} />
        <div style={{cursor: 'ew-resize'}} />
        <DraggableArea
          onDrag={(dx, dy) => this.props.onPanelDrag(dx, dy)}
          onDragEnd={() => this.props.onPanelDragEnd()}
        >
          <div style={{cursor: 'move'}} />
        </DraggableArea>
        <div style={{cursor: 'ew-resize'}} />
        <div style={{cursor: 'nesw-resize'}} />
        <div style={{cursor: 'ns-resize'}} />
        <DraggableArea
          onDrag={(dx, dy) => this.props.onPanelResize(dx, dy)}
          onDragEnd={() => this.props.onPanelResizeEnd()}
        >
          <div style={{cursor: 'nwse-resize'}} />
        </DraggableArea>
      </div>
    )
  }
}

export default EditOverlay
