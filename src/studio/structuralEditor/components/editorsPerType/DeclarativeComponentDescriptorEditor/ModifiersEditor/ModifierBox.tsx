import {React} from '$studio/handy'
import css from './ModifierBox.css'
import cx from 'classnames'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'
import {MODE_SHIFT} from '$studio/workspace/components/StudioUI/StudioUI'
import {STATUS} from '$studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/constants'
import TypeSelector from '$studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/TypeSelector';

interface IProps {
  index: number
  status: string
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
    const {status, activeMode, isABoxBeingDragged, title} = this.props
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
            [css.appear]: status === STATUS.UNINITIALIZED,
          })}
          {...(isMoving
            ? {
                style: {transform: `translate3d(${moveX}px, ${moveY}px, 0)`},
              }
            : {})}
        >
          {status === STATUS.UNINITIALIZED ? (
            <TypeSelector />
          ) : (
            <div>box</div>
          )}
        </div>
      </DraggableArea>
    )
  }
}

export default ModifierBox
