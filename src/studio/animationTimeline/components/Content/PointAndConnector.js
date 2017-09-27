// @flow
import React from 'react'
import DraggableArea from '$studio/common/components/DraggableArea'
import css from './PointAndConnector.css'

type Props = {
  point: $FlowFixMe,
  prevPoint: $FlowFixMe,
  nextPoint: $FlowFixMe,
  updatePointProps: Function,
  removePointFromLane: Function,
}

type State = {
  move: [number, number],
  leftHandleMove: [number, number],
  rightHandleMove: [number, number],
  isMoving: boolean,
}

class PointAndConnector extends React.PureComponent {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)

    this.state = {
      move: [0, 0],
      leftHandleMove: [0, 0],
      rightHandleMove: [0, 0],
      isMoving: false,
    }
  }

  pointDragStart = () => {
    this.setState(() => ({move: [0, 0]}))
  }

  pointDrag = (dx: number, dy: number, e: SyntheticMouseEvent) => {
    this.setState((state, props) => {
      let x = dx, y = dy
      const {prevPoint, nextPoint, point: {t}} = props
      if (e.altKey) y = state.move[1]
      if (e.shiftKey) x = state.move[0]
      if (t + x >= nextPoint.t || t + x <= prevPoint.t) x = state.move[0]
      return {
        move: [x, y],
        isMoving: true,
      }
    })
  }

  pointDragEnd = () => {
    const {point: {t, value}} = this.props
    const {move} = this.state
    this.props.updatePointProps({t: t + move[0], value: value + move[1]})
    this.setState(() => ({move: [0, 0], isMoving: false}))
  }

  leftHandleDrag = (dx: number, dy: number) => {
    this.setState((state, props) => {
      const {point: {handles}} = props
      let x = dx
      if (x + handles[0] > 0) x = state.leftHandleMove[0]
      return {
        leftHandleMove: [x, dy],
      }
    })
  }

  rightHandleDrag = (dx: number, dy: number) => {
    this.setState((state, props) => {
      const {point: {handles}} = props
      let x = dx
      if (x + handles[2] < 0) x = state.rightHandleMove[0]
      return {
        rightHandleMove: [x, dy],
      }
    })
  }

  leftHandleDragEnd = () => {
    const {point: {handles}} = this.props
    const {leftHandleMove} = this.state
    this.props.updatePointProps({handles: [leftHandleMove[0] + handles[0], leftHandleMove[1] + handles[1], ...handles.slice(2)]})
    this.setState(() => ({leftHandleMove: [0, 0]}))
  }

  rightHandleDragEnd = () => {
    const {point: {handles}} = this.props
    const {rightHandleMove} = this.state
    this.props.updatePointProps({handles: [...handles.slice(0, 2), rightHandleMove[0] + handles[2], rightHandleMove[1] + handles[3]]})
    this.setState(() => ({rightHandleMove: [0, 0]}))
  }

  pointClickHandle(e: SyntheticMouseEvent) {
    if (e.ctrlKey || e.metaKey) {
      this.props.removePointFromLane()
    }
  }

  render() {
    const {
      point: {id, t, value, handles, isConnected},
      nextPoint: {t: nt, value: nvalue, handles: nhandles}} = this.props
    const {move, isMoving, leftHandleMove, rightHandleMove} = this.state
    const leftHandle = [t + handles[0] + leftHandleMove[0], value + handles[1] + leftHandleMove[1]]
    const rightHandle = [t + handles[2] + rightHandleMove[0], value + handles[3] + rightHandleMove[1]]
    return (
      <g key={id}>
        {isConnected &&
          <path
            d={`M ${t} ${value} C ${t + handles[2]} ${value + handles[3]} ${[nhandles[0] + nt, nhandles[1] + nvalue , nt, nvalue].join(' ')}`}
            fill='transparent'
            strokeWidth={2}/>
        }
        <line
          stroke='dimgrey'
          x1={t + move[0]} y1={value + move[1]}
          x2={leftHandle[0] + move[0]} y2={leftHandle[1] + move[1]}/>
        <line
          stroke='dimgrey'
          x1={t + move[0]} y1={value + move[1]}
          x2={rightHandle[0] + move[0]} y2={rightHandle[1] + move[1]}/>
        <DraggableArea
          onDrag={this.leftHandleDrag}
          onDragEnd={this.leftHandleDragEnd}>
          <circle
            fill='dimgrey'
            stroke='transparent'
            cx={leftHandle[0] + move[0]} cy={leftHandle[1] + move[1]} r={2}
            className={css.handle}/>
        </DraggableArea>
        <DraggableArea
          onDrag={this.rightHandleDrag}
          onDragEnd={this.rightHandleDragEnd}>
          <circle
            fill='dimgrey'
            stroke='transparent'
            cx={rightHandle[0] + move[0]} cy={rightHandle[1] + move[1]} r={2}
            className={css.handle}/>
        </DraggableArea>
        <DraggableArea
          onDragStart={this.pointDragStart}
          onDrag={this.pointDrag}
          onDragEnd={this.pointDragEnd}>
          <circle
            fill='#222'
            strokeWidth={2}
            cx={t} cy={value} r={3}
            className={css.point}
            onMouseUp={(e) => {!isMoving ? this.pointClickHandle(e) : null}}
            {...(isMoving ? {style: {transform: `translate3d(${move[0]}px, ${move[1]}px, 0)`}} : {})}/>
        </DraggableArea>
      </g>
    )
  }
}

export default PointAndConnector