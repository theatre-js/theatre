import React from 'react'
import connect from '$theater/handy/connect'
import css from './ModifierBox.css'
import DraggableArea from '$theater/common/components/DraggableArea/DraggableArea'
import {MODES} from '$theater/common/components/ActiveModeDetector/ActiveModeDetector'
import {STATUS} from '$theater/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/constants'
import TypeSelector from '$theater/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/TypeSelector'
import _ from 'lodash'
import {ModifierInstantiationDescriptorInspector} from '$theater/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/ModifierInstantiationDescriptorInspector'
import {ITheaterStoreState} from '$theater/types'
import {ModifierIDsWithInspectorComponents} from '$theater/componentModel/coreModifierDescriptors/inspectorComponents'
import HalfPieContextMenu from '$theater/common/components/HalfPieContextMenu'
import MdCancel from 'react-icons/lib/md/cancel'
import MdDonutSmall from 'react-icons/lib/md/donut-small'
import MdStars from 'react-icons/lib/md/stars'
import resolveCss from '$shared/utils/resolveCss'

interface IOwnProps {
  index: number
  descriptorId: string
  status: string
  translateY: number
  activeMode: string
  isABoxBeingDragged: boolean
  onDragStart: (index: number, id: string, height: number, top: number) => void
  onDragEnd: () => void
  setModifierType: (id: string, type: string) => void
  deleteModifier: (id: string) => void
  moveModifier: () => void
  pathToModifierInstantiationDescriptors: string[]
}

interface IProps extends IOwnProps {
  modifierId: ModifierIDsWithInspectorComponents
  pathToModifierInstantiationDescriptor: string[]
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
  contextMenuProps:
    | undefined
    | null
    | {
        left: number
        top: number
      }
}

const INITIAL_HEIGHT = parseInt(css.minBoxHeight)
const INITIAL_RECT = {
  height: INITIAL_HEIGHT,
  left: 0,
  top: 0,
  width: 0,
}

const classes = resolveCss(css)

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
      contextMenuProps: null,
    }
  }

  componentDidMount() {
    this.container!.addEventListener('animationend', this.animationEndHandler)
    this.setState(({containerRect: {height}}, {status}) => ({
      containerRect: {
        ..._.pick(this.container!.getBoundingClientRect(), [
          'left',
          'top',
          'width',
          'height',
        ]),
        ...(status === STATUS.uninitialized ? {height} : {}),
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

  componentDidUpdate(prevProps: IProps) {
    if (
      prevProps.status === STATUS.uninitialized &&
      this.props.status === STATUS.initialized
    ) {
      this.setState(({containerRect}) => ({
        containerRect: {
          ...containerRect,
          height: this.container!.firstElementChild!.getBoundingClientRect()
            .height,
        },
      }))
    }
  }

  animationEndHandler = (e: AnimationEvent) => {
    if (e.animationName === css.containerMove) {
      this.props.moveModifier()
    }
    if (e.animationName === css.containerCollapse) {
      this.props.deleteModifier(this.props.descriptorId)
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
      this.props.descriptorId,
      containerRect.height,
      containerRect.top,
    )
    this.setState(() => ({isBeingDragged: true, containerRect}))
  }

  dragEndHandler = () => {
    this.setState(() => {
      this.props.onDragEnd()
      return {
        isBeingDragged: false,
      }
    })
  }

  confirmTypeSelectionHandler = (type: string) => {
    this.props.setModifierType(this.props.descriptorId, type)
  }

  cancelTypeSelectionHandler = () => {
    if (this.props.status === STATUS.uninitialized) {
      this.deleteModifier()
    }
  }

  deleteModifier = () => {
    const {height} = this.container!.getBoundingClientRect()
    this.setState(({containerRect}) => ({
      shouldDisappear: true,
      contextMenuProps: null,
      containerRect: {...containerRect, height},
    }))
  }

  contextMenuHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    if (this.props.status === STATUS.uninitialized) return
    const {clientX, clientY} = e
    this.setState(() => ({contextMenuProps: {left: clientX, top: clientY}}))
  }

  render() {
    const {
      status,
      activeMode,
      isABoxBeingDragged,
      translateY,
      descriptorId,
      modifierId,
      pathToModifierInstantiationDescriptor,
    } = this.props
    const {
      moveX,
      moveY,
      isBeingDragged,
      containerRect,
      shouldDisappear,
      contextMenuProps,
    } = this.state

    const shouldMove = status === STATUS.moved || status === STATUS.dragCanceled
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
      <>
        <DraggableArea
          shouldRegisterEvents={activeMode === MODES.shift}
          onDragStart={this.dragStartHandler}
          onDrag={this.dragHandler}
          onDragEnd={this.dragEndHandler}
        >
          <div
            ref={c => (this.container = c)}
            style={style}
            {...classes(
              'container',
              status === STATUS.uninitialized && 'appear',
              status === STATUS.initialized && 'initialize',
              isBeingDragged && 'isBeingDragged',
              shouldDisappear && 'collapse',
              shouldMove && 'move',
            )}
            onContextMenu={this.contextMenuHandler}
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
              <ModifierInstantiationDescriptorInspector
                id={descriptorId}
                modifierId={modifierId}
                pathToModifierInstantiationDescriptor={
                  pathToModifierInstantiationDescriptor
                }
              />
            )}
          </div>
        </DraggableArea>
        {contextMenuProps != null && (
          <HalfPieContextMenu
            close={() => this.setState(() => ({contextMenuProps: null}))}
            centerPoint={contextMenuProps}
            placement="right"
            items={[
              {
                label: '$A$dd to Timeline',
                cb: () => null,
                IconComponent: MdDonutSmall,
              },
              {
                label: '$D$elete Modifier',
                cb: this.deleteModifier,
                IconComponent: MdCancel,
              },
              {
                label: '$O$verride Previous Modifiers',
                cb: () => null,
                IconComponent: MdStars,
              },
            ]}
          />
        )}
      </>
    )
  }
}

export default connect((s: ITheaterStoreState, op: IOwnProps) => {
  const pathToModifierInstantiationDescriptor = op.pathToModifierInstantiationDescriptors.concat(
    'byId',
    op.descriptorId,
  )
  const {modifierId} = _.get(s, pathToModifierInstantiationDescriptor)
  return {
    modifierId,
    pathToModifierInstantiationDescriptor,
  }
})(ModifierBox)
