// @flow
import * as React from 'react'
import css from './SortableBox.css'
import DraggableArea from '$studio/common/components/DraggableArea'
import {Broadcast} from 'react-broadcast'

type Props = {
  showMergeOverlay: boolean
  translateY: number
  height: number
  onMoveStart: Function
  onMove: Function
  onMoveEnd: Function
  onResize: Function
  children: React.Node
}

type State = {
  isMoving: boolean
  moveY: number
  resizeY: number
}

export const SortableBoxDragChannel = 'TheaterJS/SortableBoxDragChannel'

class LaneBox extends React.Component<Props, State> {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)

    this.state = {
      isMoving: false,
      moveY: 0,
      resizeY: 0,
    }
  }

  onMoveStart = () => {
    this.setState(() => ({
      isMoving: true,
    }))
    this.props.onMoveStart()
  }

  onMove = (dy: number) => {
    this.setState(() => ({
      moveY: dy,
    }))
    this.props.onMove(dy)
  }

  onMoveEnd = () => {
    this.setState(() => ({
      isMoving: false,
      moveY: 0,
    }))
    this.props.onMoveEnd()
  }

  onResize = (dy: number) => {
    const ylow = 60 - this.props.height
    this.setState(() => ({
      resizeY: dy > ylow ? dy : ylow,
    }))
  }

  onResizeEnd = () => {
    const newHeight = this.props.height + this.state.resizeY
    this.props.onResize(newHeight)
    this.setState(() => ({
      resizeY: 0,
    }))
  }

  render() {
    const {height, translateY, children} = this.props
    const {isMoving, moveY, resizeY} = this.state
    const moveHandleStyle = {
      ...isMoving ? {opacity: 1, zIndex: 100} : {},
    }
    const containerStyle = {
      height: `${height + resizeY}px`,
      ...isMoving ? {zIndex: 500, transform: `translateY(${moveY}px)`} : {},
      ...!isMoving && translateY !== 0
        ? {transform: `translateY(${translateY}px)`}
        : {},
    }
    return (
      <div className={css.container} style={containerStyle}>
        {/* <DraggableArea
          onDragStart={this.onMoveStart}
          onDrag={(_, dy) => this.onMove(dy)}
          onDragEnd={this.onMoveEnd}
        >
          <div className={css.moveHandle} style={moveHandleStyle}>
            {String.fromCharCode(0x2630)}
          </div>
        </DraggableArea> */}
        <div className={css.content}>
          <Broadcast
            channel={SortableBoxDragChannel}
            value={{
              onDragStart: this.onMoveStart,
              onDrag: (dy) => this.onMove(dy),
              onDragEnd: this.onMoveEnd,
            }}>
              {children}
          </Broadcast>
          {/* {showMergeOverlay && (
            <div className={css.mergeOverlay}>Drop to merge.</div>
          )} */}
        </div>
        <DraggableArea
          onDrag={(_, dy) => this.onResize(dy)}
          onDragEnd={this.onResizeEnd}
        >
          <div className={css.resizeHandle} />
        </DraggableArea>
      </div>
    )
  }
}

export default LaneBox
