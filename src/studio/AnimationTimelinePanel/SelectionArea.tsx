import {React} from '$src/studio/handy'
import css from './SelectionArea.css'
import cx from 'classnames'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'

interface Props {
  status: $FixMe
  left?: number
  top?: number
  width?: number
  height?: number
  onEnd: Function
}

interface State {}

class SelectionArea extends React.Component<Props, State> {
  initialX: number = 0
  initialY: number = 0

  dragHandler = (dx: number, dy: number) => {
    this.props.onMove(dx + this.initialX, dy + this.initialY)
    // this.props.onMove(dx, dy)
  }

  dragStartHandler = () => {
    this.initialX = this.props.move.x || 0
    this.initialY = this.props.move.y || 0
  }

  dragEndHandler = () => {}

  render() {
    const {status} = this.props
    const isSelectionConfirmed = status === 'CONFIRMED'

    if (status === 'ACTIVE' || isSelectionConfirmed) {
      let {left, top, width, height} = this.props
      left = width < 0 ? left + width : left
      top = height < 0 ? top + height : top
      width = Math.abs(width)
      height = Math.abs(height)
      return (
        <div className={css.container} onClick={() => this.props.onEnd()}>
          <DraggableArea
            shouldRegisterEvents={isSelectionConfirmed}
            onDragStart={this.dragStartHandler}
            onDrag={this.dragHandler}
            onDragEnd={this.dragEndHandler}
          >
            <div
              style={{
                transform: `translate3d(
                  ${this.props.move.x}px,
                  ${this.props.move.y}px,
                  0)`,
              }}
            >
              <div
                className={cx(css.selection, {
                  [css.shrink]: isSelectionConfirmed,
                })}
                style={{left, top, width, height}}
                onClick={e => {
                  e.stopPropagation()
                }}
              />
            </div>
          </DraggableArea>
        </div>
      )
    }

    return null
  }
}

export default SelectionArea
