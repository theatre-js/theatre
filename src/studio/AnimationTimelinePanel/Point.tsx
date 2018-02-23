// @flow
import React from 'react'
import css from './Point.css'
import Connector from './Connector'
import cx from 'classnames'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'
import SingleInputForm from '$lf/common/components/SingleInputForm'
import {PanelPropsChannel} from '$src/studio/workspace/components/Panel/Panel'
import {Subscriber} from 'react-broadcast'
import {
  MODE_D,
  MODE_C,
  MODE_H,
  MODE_CMD,
} from '$studio/workspace/components/StudioUI/StudioUI'
import {
  NormalizedPoint,
  PointHandles,
  Point as IPoint,
} from '$studio/animationTimeline/types'

type Props = {
  color: string
  pointIndex: number
  point: NormalizedPoint
  prevPoint: undefined | null | NormalizedPoint
  nextPoint: undefined | null | NormalizedPoint
  getSvgSize: Function
  addConnector: Function
  changePointPositionBy: Function
  changePointHandlesBy: Function
  removePoint: Function
  makeHandleHorizontal: Function
  showPointValuesEditor: Function
  showContextMenu: Function
}

type State = {
  isMoving: boolean
  pointMove: [number, number]
  handlesMove: PointHandles
}

class Point extends React.Component<Props, State> {
  svgSize: {width: number, height: number}
  leftHandleNormalizers: {xNormalizer: number, yNormalizer: number}
  rightHandleNormalizers: {xNormalizer: number, yNormalizer: number}
  props: Props
  state: State
  valueForm: SingleInputForm
  timeForm: SingleInputForm

  constructor(props: Props) {
    super(props)

    this.state = {
      isMoving: false,
      pointMove: [0, 0],
      handlesMove: [0, 0, 0, 0],
    }
    this.svgSize = props.getSvgSize()
  }

  _resetState() {
    this.setState(() => ({
      isMoving: false,
      pointMove: [0, 0],
      handlesMove: [0, 0, 0, 0],
    }))
  }

  pointClickHandler = (e: $FixMe, activeMode: string) => {
    e.preventDefault()
    e.stopPropagation()
    switch (activeMode) {
      case MODE_C:
        this.props.addConnector(this.props.pointIndex)
        break
      case MODE_CMD:
        this.props.addConnector(this.props.pointIndex)
        break
      case MODE_D:
        this.props.removePoint(this.props.pointIndex)
        break
      default: {
        const {left, top, width, height} = e.target.getBoundingClientRect()
        const params = {
          left: left + width / 2,
          top: top + height / 2,
          initialTime: this.props.point._t,
          initialValue: this.props.point._value,
        }
        this.props.showPointValuesEditor(this.props.pointIndex, params)
      }
    }
  }

  handleClickHandler = (
    e: SyntheticMouseEvent<>,
    side: 'left' | 'right',
    activeMode: string,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    // console.log(activeMode)
    if (activeMode === MODE_H) {
      return this.props.makeHandleHorizontal(this.props.pointIndex, side)
    }
  }

  pointDragStartHandler = () => {
    this._addGlobalCursorRule()
    this.svgSize = this.props.getSvgSize()
  }

  pointDragHandler = (dx: number, dy: number, e: SyntheticMouseEvent<>) => {
    const {width, height} = this.svgSize
    let x = dx / width * 100
    // if (e.altKey) y = this.state.pointMove[1]
    // if (e.shiftKey) x = this.state.pointMove[0]

    const {point, prevPoint, nextPoint} = this.props
    const limitLeft = prevPoint == null ? 0 : prevPoint.time
    const limitRight = nextPoint == null ? 100 : nextPoint.time

    const newT = point.time + x
    if (newT >= limitRight) x = limitRight - point.time - (100 / width)
    if (newT <= limitLeft) x = limitLeft - point.time + (100 / width)

    this.setState(() => ({
      isMoving: true,
      pointMove: [x, dy / height * 100],
    }))
  }

  changePointPosition = (dragHappened: boolean) => {
    this._removeGlobalCursorRule()
    if (!dragHappened) return
    const {pointMove} = this.state
    this.props.changePointPositionBy(this.props.pointIndex, {
      time: pointMove[0],
      value: pointMove[1],
    })
    this._resetState()
  }

  leftHandleDragStartHandler = () => {
    this._addGlobalCursorRule()
    const {width, height} = this.props.getSvgSize()
    const {point, prevPoint} = this.props
    this.leftHandleNormalizers = {
      xNormalizer: (prevPoint.time - point.time) * width,
      yNormalizer: (prevPoint.value - point.value) * height,
    }
  }

  leftHandleDragHandler = (dx: number, dy: number) => {
    const {xNormalizer, yNormalizer} = this.leftHandleNormalizers
    this.setState(() => ({
      isMoving: true,
      handlesMove: [dx / xNormalizer * 100, dy / yNormalizer * 100, 0, 0],
    }))
  }

  rightHandleDragStartHandler = () => {
    this._addGlobalCursorRule()
    const {width, height} = this.props.getSvgSize()
    const {point, nextPoint} = this.props
    this.rightHandleNormalizers = {
      xNormalizer: (nextPoint.time - point.time) * width,
      yNormalizer: (nextPoint.value - point.value) * height,
    }
  }

  rightHandleDragHandler = (dx: number, dy: number) => {
    const {xNormalizer, yNormalizer} = this.rightHandleNormalizers
    this.setState(() => ({
      isMoving: true,
      handlesMove: [0, 0, dx / xNormalizer * 100, dy / yNormalizer * 100],
    }))
  }

  changePointHandles = () => {
    this._removeGlobalCursorRule()
    const {handlesMove} = this.state
    this.props.changePointHandlesBy(this.props.pointIndex, handlesMove)
    this._resetState()
  }

  _addGlobalCursorRule() {
    document.body.classList.add('pointDrag')
  }

  _removeGlobalCursorRule() {
    document.body.classList.remove('pointDrag')
  }

  contextMenuHandler = e => {
    e.stopPropagation()
    e.preventDefault()
    const {clientX, clientY} = e
    const pos = {left: clientX, top: clientY}
    this.props.showContextMenu(this.props.pointIndex, pos)
  }

  _renderTransformedPoint() {
    const {point, prevPoint, nextPoint} = this.props
    const {pointMove, handlesMove} = this.state
    const newT = point.time + pointMove[0]
    const newValue = point.value + pointMove[1]

    const movedPoint: IPoint = {
      ...(point as any),
      time: newT,
      value: newValue,
      interpolationDescriptor: {
        ...point.interpolationDescriptor,
        handles: point.interpolationDescriptor.handles
          .slice(0, 2)
          .map(
            (handle: number, index: number) => (handle + handlesMove[index + 2]),
          )
          .concat(point.interpolationDescriptor.handles.slice(2)),
      },
    }
    const newPrevPoint =
      prevPoint != null
        ? {
            ...(prevPoint as any),
            interpolationDescriptor: {
              ...prevPoint.interpolationDescriptor,
              handles: prevPoint.interpolationDescriptor.handles
                .slice(0, 2)
                .concat(
                  prevPoint.interpolationDescriptor.handles
                    .slice(2)
                    .map((handle: number, index: number) => handle + handlesMove[index]),
                ),
            },
          }
        : prevPoint

    return (
      <g opacity={0.5}>
        {point.interpolationDescriptor.connected &&
          nextPoint != null && (
            <Connector leftPoint={movedPoint} rightPoint={nextPoint} />
          )}
        {newPrevPoint != null &&
          newPrevPoint.interpolationDescriptor.connected && (
            <Connector leftPoint={newPrevPoint} rightPoint={movedPoint} />
          )}
        <circle
          fill="#222"
          strokeWidth={2}
          cx={`${movedPoint.time}%`}
          cy={`${movedPoint.value}%`}
          r={3}
          className={css.point}
        />
      </g>
    )
  }

  render() {
    const {point, prevPoint, nextPoint, color} = this.props
    const {time, value, interpolationDescriptor} = point
    const handles = (prevPoint
      ? prevPoint.interpolationDescriptor.handles.slice(2)
      : [0, 0]
    ).concat(interpolationDescriptor.handles.slice(0, 2))
    const {isMoving, handlesMove} = this.state

    const renderLeftHandle =
      prevPoint != null && prevPoint.interpolationDescriptor.connected && prevPoint.value !== value
    const renderRightHandle =
      nextPoint != null && point.interpolationDescriptor.connected && nextPoint.value !== value

    const x = `${time}%`
    const y = `${value}%`
    const leftHandle = renderLeftHandle && [
      `${time + (handles[0] + handlesMove[0]) * (prevPoint.time - time)}%`,
      `${value + (handles[1] + handlesMove[1]) * (prevPoint.value - value)}%`,
    ]
    const rightHandle = renderRightHandle && [
      `${time + (handles[2] + handlesMove[2]) * (nextPoint.time - time)}%`,
      `${value + (handles[3] + handlesMove[3]) * (nextPoint.value - value)}%`,
    ]
    return (
      <Subscriber channel={PanelPropsChannel}>
        {({activeMode}) => {
          const isInDeleteMode = activeMode === MODE_D
          return (
            <g>
              {isMoving && this._renderTransformedPoint()}
              {renderLeftHandle && (
                <line
                  x1={x}
                  y1={y}
                  x2={leftHandle[0]}
                  y2={leftHandle[1]}
                  fill={color.darkened}
                  stroke={color.darkened}
                />
              )}
              {renderRightHandle && (
                <g>
                  <line
                    x1={x}
                    y1={y}
                    x2={rightHandle[0]}
                    y2={rightHandle[1]}
                    fill={color.darkened}
                    stroke={color.darkened}
                  />
                </g>
              )}
              <DraggableArea
                onDragStart={this.pointDragStartHandler}
                onDrag={this.pointDragHandler}
                onDragEnd={this.changePointPosition}
              >
                <g>
                  <rect
                    width="16"
                    height="16"
                    x={x}
                    y={y}
                    fill="transparent"
                    stroke="transparent"
                    transform={`translate(-8 -8)`}
                    onContextMenu={this.contextMenuHandler}
                    onClick={e => this.pointClickHandler(e, activeMode)}
                    className={cx(css.pointClickRect, {
                      [css.highlightRedOnHover]: isInDeleteMode,
                    })}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={6}
                    className={css.pointGlow}
                  />
                  <circle
                    strokeWidth="2"
                    cx={x}
                    cy={y}
                    r={3.2}
                    className={css.pointStroke}
                    vectorEffect='non-scaling-stroke'
                  />
                  <circle
                    fill="#1C2226"
                    stroke="transparent"
                    cx={x}
                    cy={y}
                    r={2.4}
                    className={css.pointCenter}
                  />
                </g>
              </DraggableArea>
              {renderLeftHandle && (
                <DraggableArea
                  onDragStart={this.leftHandleDragStartHandler}
                  onDrag={this.leftHandleDragHandler}
                  onDragEnd={this.changePointHandles}
                >
                  <g>
                    <rect
                      width="12"
                      height="12"
                      x={leftHandle[0]}
                      y={leftHandle[1]}
                      fill="transparent"
                      stroke="transparent"
                      transform={`translate(${handlesMove[0] - 6} ${handlesMove[1] - 6})`}
                      onClick={e =>
                        this.handleClickHandler(e, 'left', activeMode)
                      }
                      className={css.handleClickRect}
                    />
                    <circle
                      strokeWidth="1"
                      cx={leftHandle[0]}
                      cy={leftHandle[1]}
                      r={2}
                      className={css.handle}
                      stroke={color.darkened}
                      fill={color.darkened}
                    />
                  </g>
                </DraggableArea>
              )}
              {renderRightHandle && (
                <DraggableArea
                  onDragStart={this.rightHandleDragStartHandler}
                  onDrag={this.rightHandleDragHandler}
                  onDragEnd={this.changePointHandles}
                >
                  <g>
                    <rect
                      width="12"
                      height="12"
                      x={rightHandle[0]}
                      y={rightHandle[1]}
                      fill="transparent"
                      stroke="transparent"
                      onClick={e =>
                        this.handleClickHandler(e, 'right', activeMode)
                      }
                      transform={`translate(${handlesMove[2] - 6} ${handlesMove[3] - 6})`}
                      className={css.handleClickRect}
                    />
                    <circle
                      strokeWidth="1"
                      cx={rightHandle[0]}
                      cy={rightHandle[1]}
                      r={2}
                      className={css.handle}
                      stroke={color.darkened}
                      fill={color.darkened}
                    />
                  </g>
                </DraggableArea>
              )}
            </g>
          )
        }}
      </Subscriber>
    )
  }
}

export default Point
