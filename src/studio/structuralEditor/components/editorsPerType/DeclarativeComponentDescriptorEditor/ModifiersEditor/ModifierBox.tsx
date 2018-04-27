import {React} from '$studio/handy'
import css from './ModifierBox.css'
import cx from 'classnames'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'
import {MODE_SHIFT} from '$studio/workspace/components/StudioUI/StudioUI'
import {STATUS} from '$studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/constants'
import TypeSelector from '$studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/TypeSelector'
import _ from 'lodash'

interface IProps {
  index: number
  modifierId: string
  status: string
  title: string
  activeMode: string
  isABoxBeingDragged: boolean
  onDragStart(index: number): void
  onDragEnd(): void
  setBoxType(id: string, type: string): void
}

interface IState {
  moveX: number
  moveY: number
  isMoving: boolean
  containerRect: {
    left: number
    top: number
    width: number
    height: number
  }
}

const INITIAL_HEIGHT = 27
const INITIAL_RECT = {
  height: INITIAL_HEIGHT,
  left: 0,
  top: 0,
  width: 0,
}

class ModifierBox extends React.PureComponent<IProps, IState> {
  containerBoundingClientRect: ClientRect | DOMRect
  container: HTMLDivElement | null

  constructor(props: IProps) {
    super(props)

    this.state = {
      moveX: 0,
      moveY: 0,
      isMoving: false,
      containerRect: INITIAL_RECT,
    }
  }

  componentDidMount() {
    this.setState(({containerRect: {height}}) => ({
      containerRect: {
        ..._.pick(this.container!.getBoundingClientRect(), [
          'left',
          'top',
          'width',
        ]),
        height,
      },
    }))
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

  onSelectType = (type: string) => {
    this.props.setBoxType(this.props.modifierId, type)
  }

  render() {
    const {status, activeMode, isABoxBeingDragged, title} = this.props
    const {moveX, moveY, isMoving, containerRect} = this.state
    return (
      <DraggableArea
        shouldRegisterEvents={activeMode === MODE_SHIFT}
        onDragStart={this.dragStartHandler}
        onDrag={this.dragHandler}
        onDragEnd={this.dragEndHandler}
      >
        <div
          ref={c => (this.container = c)}
          className={cx(css.container, {
            [css.isMoving]: isMoving,
            [css.isABoxBeingDragged]: isABoxBeingDragged,
            [css.appear]: status === STATUS.UNINITIALIZED,
          })}
          style={{'--height': containerRect.height}}
          {...(isMoving
            ? {
                style: {transform: `translate3d(${moveX}px, ${moveY}px, 0)`},
              }
            : {})}
        >
          {status === STATUS.UNINITIALIZED ? (
            this.container != null &&
            <TypeSelector {...containerRect} onSelect={this.onSelectType} onCancel={() => console.log('canceled')}/>
          ) : (
            <div>{title}</div>
          )}
        </div>
      </DraggableArea>
    )
  }
}

export default ModifierBox
