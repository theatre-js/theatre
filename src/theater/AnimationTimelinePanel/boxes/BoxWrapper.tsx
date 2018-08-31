import React from 'react'
import css from './BoxWrapper.css'
import resolveCss from '$shared/utils/resolveCss'
import {
  BoxDnDAPIChannel,
  BoxDnDStateChannel,
} from '$theater/AnimationTimelinePanel/boxes/BoxesContainer'
import {
  TBoxDnDAPI,
  TBoxDnDState,
} from '$theater/AnimationTimelinePanel/boxes/types'
import {Subscriber} from 'react-broadcast'
import {
  ActiveMode,
  MODES,
} from '$theater/common/components/ActiveModeDetector/ActiveModeDetector'
import {PanelActiveModeChannel} from '$theater/workspace/components/Panel/Panel'
import DraggableArea from '$theater/common/components/DraggableArea/DraggableArea'
import {
  RootPropGetterChannel,
  TPropGetter,
} from '$theater/AnimationTimelinePanel/RootPropProvider'
import {disableEvent} from '$theater/AnimationTimelinePanel/utils'
import {clamp} from 'lodash-es'
import {reduceHistoricState} from '$theater/bootstrap/actions'
import {BoxObject} from '$theater/AnimationTimelinePanel/types'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'

const classes = resolveCss(css)

interface IOwnProps {
  height: number
  index: number
  boxId: BoxObject['id']
  pathToTimeline: string[]
  dopeSheet: BoxObject['dopeSheet']
  numberOfVariables: number
  children: React.ReactNode
}

interface IProps extends IOwnProps {
  dndAPI: TBoxDnDAPI
  dndState: TBoxDnDState
  activeMode: ActiveMode
  propGetter: TPropGetter
}

interface IState {
  moveY: number
  resizeY: number
  toggleTo: null | 'dopeSheet' | 'graphView'
}

export const MIN_BOX_HEIGHT = parseInt(css.minBoxHeight)

class BoxWrapper extends PureComponentWithTheater<IProps, IState> {
  container: HTMLDivElement | null
  containerOffsetTop: number = 0

  state = {moveY: 0, resizeY: 0, toggleTo: null}

  componentDidMount() {
    this.container!.addEventListener('animationend', this.animationEndHandler)
  }

  componentWillUnmount() {
    this.container!.removeEventListener(
      'animationend',
      this.animationEndHandler,
    )
  }

  render() {
    const {
      activeMode,
      dndState,
      index,
      propGetter,
      dopeSheet,
      numberOfVariables,
    } = this.props
    const {moveY, resizeY, toggleTo} = this.state
    const dopeSheetHeight = numberOfVariables * MIN_BOX_HEIGHT
    const graphViewHeight = this.props.height + resizeY
    const height = dopeSheet ? dopeSheetHeight : graphViewHeight

    const isGrab = dndState.status === 'grab'
    const isMove = dndState.status === 'move'
    const isMerge = dndState.status === 'merge'

    const shouldMoveUp = isGrab && index > dndState.grabProps!.index
    const shouldMoveDown =
      isMove &&
      index >= dndState.dropProps!.index &&
      index !== dndState.grabProps!.index

    const shouldToggleToDopeSheet = !dopeSheet && toggleTo === 'dopeSheet'
    const shouldToggleToGraphView = dopeSheet && toggleTo === 'graphView'
    const shouldToggle = shouldToggleToDopeSheet || shouldToggleToGraphView

    const isDragging = isGrab && index === dndState.grabProps!.index
    const isMoved = isMove && index === dndState.grabProps!.index
    const isMerged = isMerge && index === dndState.grabProps!.index

    const shouldRenderDropZone = isGrab && index !== dndState.grabProps!.index
    const shouldRenderMoveHandle =
      (activeMode === MODES.shift && dndState.status === 'noDnD') || isDragging

    const containerStyle = {
      height,
      ...(shouldMoveUp ? {'--translateY': dndState.grabProps!.height} : {}),
      ...(shouldMoveDown ? {'--translateY': dndState.grabProps!.height} : {}),
      ...(shouldToggleToDopeSheet
        ? {
            '--fromHeight': graphViewHeight,
            '--toHeight': dopeSheetHeight,
          }
        : {}),
      ...(shouldToggleToGraphView
        ? {
            '--fromHeight': dopeSheetHeight,
            '--toHeight': graphViewHeight,
          }
        : {}),
      ...(isDragging
        ? {
            transform: `translate3d(0, ${moveY}px, 0)`,
            '--offsetTop': this.containerOffsetTop,
          }
        : {}),
      ...(isMoved
        ? {
            '--fromY': moveY,
            '--toY': dndState.dropProps!.top - dndState.grabProps!.top,
            '--offsetTop': this.containerOffsetTop,
          }
        : {}),
      ...(isMerged
        ? {
            '--fromY': moveY,
            '--toY': dndState.dropProps!.top - dndState.grabProps!.top,
            '--fromHeight': height,
            '--toHeight': dndState.dropProps!.height,
            '--offsetTop': this.containerOffsetTop,
          }
        : {}),
    }

    return (
      <div
        ref={c => (this.container = c)}
        {...classes(
          'container',
          shouldMoveUp && 'moveUp',
          shouldMoveDown && 'moveDown',
          shouldToggle && 'toggleView',
          isDragging && 'isDragging',
          isMoved && 'isMoved',
          isMerged && 'isMerged',
        )}
        style={containerStyle}
        onDoubleClick={this.toggleBoxViewMode}
      >
        {this.props.children}
        {!dopeSheet && (
          <DraggableArea
            onDrag={this.resizeHandler}
            onDragEnd={this.resizeEndHandler}
          >
            <div {...classes('resizeHandle')} />
          </DraggableArea>
        )}
        {shouldRenderMoveHandle && (
          <DraggableArea
            onDragStart={this.dragStartHandler}
            onDrag={this.dragHandler}
          >
            <div {...classes('moveHandle', isDragging && 'isDragging')} />
          </DraggableArea>
        )}
        {shouldRenderDropZone && (
          <div
            {...classes('dropZone')}
            style={{'--panelWidth': propGetter('panelWidth')}}
            onWheel={disableEvent}
          >
            <div {...classes('top')} onMouseUp={this.moveToPrevious} />
            <div {...classes('middle')} onMouseUp={this.merge} />
            <div {...classes('bottom')} onMouseUp={this.moveToNext} />
          </div>
        )}
      </div>
    )
  }

  animationEndHandler = (e: AnimationEvent) => {
    if (e.animationName === css.containerToggle) {
      this.setState(
        () => ({
          toggleTo: null,
        }),
        this._toggleBoxView,
      )
    }
  }

  dragStartHandler = () => {
    this.setState(
      () => ({moveY: 0}),
      () => {
        const {dndAPI, index, dopeSheet} = this.props
        this.containerOffsetTop = this.container!.offsetTop
        const {top, height} = this.container!.getBoundingClientRect()
        dndAPI.grab(index, height, top, dopeSheet)
      },
    )
  }

  dragHandler = (_: number, y: number) => {
    this.setState(() => ({moveY: y}))
  }

  resizeHandler = (_: number, dy: number) => {
    this.setState((_, {height}) => {
      return {
        resizeY: clamp(dy, MIN_BOX_HEIGHT - height, dy),
      }
    })
  }

  resizeEndHandler = (resizeHappened: boolean) => {
    let newHeight: number
    this.setState(
      ({resizeY}, {height}) => {
        newHeight = resizeY + height
        return {resizeY: 0}
      },
      () => {
        if (resizeHappened) {
          this.dispatch(
            reduceHistoricState(
              [
                ...this.props.pathToTimeline,
                'boxes',
                this.props.boxId,
                'height',
              ],
              () => newHeight,
            ),
          )
        }
      },
    )
  }

  moveToPrevious = () => {
    this.props.dndAPI.move(
      this.props.index,
      this.container!.getBoundingClientRect().top,
    )
  }

  moveToNext = () => {
    this.props.dndAPI.move(
      this.props.index + 1,
      this.container!.getBoundingClientRect().bottom,
    )
  }

  merge = () => {
    this.props.dndAPI.merge(
      this.props.index,
      this.props.height,
      this.container!.getBoundingClientRect().top,
      this.props.dopeSheet,
    )
  }

  toggleBoxViewMode = () => {
    this.setState((_, {dopeSheet}) => ({
      toggleTo: dopeSheet ? 'graphView' : 'dopeSheet',
    }))
  }

  _toggleBoxView = () => {
    const {pathToTimeline, boxId} = this.props
    this.dispatch(
      reduceHistoricState(
        [...pathToTimeline, 'boxes', boxId, 'dopeSheet'],
        (dopeSheet: boolean) => !dopeSheet,
      ),
    )
  }
}

export default (props: IOwnProps) => (
  <Subscriber channel={BoxDnDAPIChannel}>
    {(dndAPI: TBoxDnDAPI) => (
      <Subscriber channel={RootPropGetterChannel}>
        {(propGetter: TPropGetter) => (
          <Subscriber channel={BoxDnDStateChannel}>
            {(dndState: TBoxDnDState) => (
              <Subscriber channel={PanelActiveModeChannel}>
                {(activeMode: ActiveMode) => (
                  <BoxWrapper
                    {...props}
                    dndAPI={dndAPI}
                    dndState={dndState}
                    propGetter={propGetter}
                    activeMode={activeMode}
                  />
                )}
              </Subscriber>
            )}
          </Subscriber>
        )}
      </Subscriber>
    )}
  </Subscriber>
)
