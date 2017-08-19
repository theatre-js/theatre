// @flow
import React from 'react'

type Props = {
  children: any,
  onDragStart: Function,
  onDragEnd: Function,
  onDrag: Function,
}

type State = {
  isDragging: boolean,
  startPos: {
    x: number,
    y: number,
  },
}

class DraggableArea extends React.Component {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)
    this.state = {
      isDragging: false,
      startPos: {
        x: 0,
        y: 0,
      },
    }
  }

  dragStartHandler = (e: SyntheticMouseEvent) => {
    const {screenX, screenY} = e
    this.setState(() => ({
      isDragging: true,
      startPos: {
        x: screenX,
        y: screenY,
      },
    }))
    this.props.onDragStart()
  }

  dragEndHandler = () => {
    if (this.state.isDragging) {
      this.setState(() => ({isDragging: false}))
      this.props.onDragEnd()
    }
  }

  dragHandler = (e: SyntheticMouseEvent) => {
    if (!this.state.isDragging) return
    
    const {startPos} = this.state
    this.props.onDrag(e.screenX - startPos.x, e.screenY - startPos.y)
  }

  render() {
    return (
      <div
        onMouseDown={this.dragStartHandler}
        onMouseUp={this.dragEndHandler}
        onMouseMove={this.dragHandler}>
        {this.props.children}
      </div>
    )
  }
}

export default DraggableArea