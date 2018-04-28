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
  translateY: number
  activeMode: string
  isABoxBeingDragged: boolean
  onDragStart: (index: number, id: string, height: number, top: number) => void
  onDragEnd: () => void
  setModifierType: (id: string, type: string) => void
  deleteModifier: (id: string) => void
  moveModifier: () => void
}

interface IState {
  moveX: number
  moveY: number
  isBeingDragged: boolean
  shouldDisappear: boolean
  containerRect: {
    left: number
    top: number
    width: number
    height: number
  }
}

const INITIAL_HEIGHT = parseInt(css.minBoxHeight)
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
      isBeingDragged: false,
      shouldDisappear: false,
      containerRect: INITIAL_RECT,
    }
  }

  componentDidMount() {
    this.container!.addEventListener('animationend', this.animationEndHandler)
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

  componentWillUnmount() {
    this.container!.removeEventListener(
      'animationend',
      this.animationEndHandler,
    )
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.status === STATUS.unchanged) {
      this.setState(() => ({
        moveX: 0,
        moveY: 0,
      }))
    }
  }

  animationEndHandler = (e: AnimationEvent) => {
    if (e.animationName === css.containerMove) {
      this.props.moveModifier()
    }
  }

  dragHandler = (moveX: number, moveY: number) => {
    this.setState(() => ({
      moveX,
      moveY,
    }))
  }

  dragStartHandler = () => {
    const containerRect = _.pick(this.container!.getBoundingClientRect(), [
      'left',
      'top',
      'width',
      'height',
    ])
    this.props.onDragStart(
      this.props.index,
      this.props.modifierId,
      containerRect.height,
      containerRect.top,
    )
    this.setState(() => ({isBeingDragged: true, containerRect}))
  }

  dragEndHandler = () => {
    this.setState(() => ({
      isBeingDragged: false,
    }))
    this.props.onDragEnd()
  }

  confirmTypeSelectionHandler = (type: string) => {
    this.props.setModifierType(this.props.modifierId, type)
  }

  cancelTypeSelectionHandler = () => {
    if (this.props.status === STATUS.uninitialized) {
      this.deleteModifier()
    }
  }

  deleteModifier() {
    const {height} = this.container!.getBoundingClientRect()
    this.setState(({containerRect}) => ({
      shouldDisappear: true,
      containerRect: {...containerRect, height},
    }))
    //FIXME:
    setTimeout(() => {
      this.props.deleteModifier(this.props.modifierId)
    }, 300)
  }

  render() {
    const {
      status,
      activeMode,
      isABoxBeingDragged,
      translateY,
      title,
    } = this.props
    const {
      moveX,
      moveY,
      isBeingDragged,
      containerRect,
      shouldDisappear,
    } = this.state

    const shouldMove =
      status === STATUS.moved || status === STATUS.dragCanceled
    const style = {
      '--height': containerRect.height,
      ...(shouldMove
        ? {
            '--fromX': `${moveX}px`,
            '--fromY': `${moveY}px`,
            '--toY': `${translateY}px`,
          }
        : {}),
      ...(isBeingDragged
        ? {
            transform: `translate3d(${moveX}px, ${moveY}px, 0)`,
          }
        : isABoxBeingDragged
          ? {
              transform: `translate3d(0, ${translateY}px, 0)`,
              transition: 'transform .2s ease-in-out',
            }
          : {}),
    }
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
            [css.isBeingDragged]: isBeingDragged,
            [css.appear]: status === STATUS.uninitialized,
            [css.initialize]: status === STATUS.initialized,
            [css.collapse]: shouldDisappear,
            [css.move]: shouldMove,
          })}
          style={style}
        >
          {status === STATUS.uninitialized ? (
            this.container != null &&
            !shouldDisappear && (
              <TypeSelector
                {...containerRect}
                onSelect={this.confirmTypeSelectionHandler}
                onCancel={this.cancelTypeSelectionHandler}
              />
            )
          ) : (
            <div>{title}</div>
          )}
        </div>
      </DraggableArea>
    )
  }
}

export default ModifierBox
