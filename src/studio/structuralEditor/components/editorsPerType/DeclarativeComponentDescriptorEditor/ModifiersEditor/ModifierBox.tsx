import {React} from '$studio/handy'
import css from './ModifierBox.css'
import cx from 'classnames'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'
import {MODE_SHIFT} from '$studio/workspace/components/StudioUI/StudioUI'

interface IProps {
  index: number
  title: string
  activeMode: string
  isABoxBeingDragged: boolean
  onDragStart: Function
  onDragEnd: Function
}

interface IState {
  moveX: number
  moveY: number
  isMoving: boolean
}

class ModifierBox extends React.PureComponent<IProps, IState> {
  state = {
    moveX: 0,
    moveY: 0,
    isMoving: false,
  }

  dragHandler = (moveX: number, moveY: number) => {
    this.setState(() => ({
      moveX,
      moveY,
    }))
  }

  dragStartHandler = () => {
    this.props.onDragStart(this.props.index)
    this.setState(() => ({isMoving: true}))
  }

  dragEndHandler = () => {
    this.props.onDragEnd()
    this.setState(() => ({
      isMoving: false,
      moveX: 0,
      moveY: 0,
    }))
  }

  render() {
    const {activeMode, isABoxBeingDragged, title} = this.props
    const {moveX, moveY, isMoving} = this.state
    return (
      <DraggableArea
        shouldRegisterEvents={activeMode === MODE_SHIFT}
        onDragStart={this.dragStartHandler}
        onDrag={this.dragHandler}
        onDragEnd={this.dragEndHandler}
      >
        <div
          className={cx(css.container, {
            [css.isMoving]: isMoving,
            [css.isABoxBeingDragged]: isABoxBeingDragged,
          })}
          {...(isMoving
            ? {
                style: {transform: `translate3d(${moveX}px, ${moveY}px, 0)`},
              }
            : {})}
        >
          {title}-{this.props.index}
        </div>
      </DraggableArea>
    )
  }
}

export default ModifierBox
