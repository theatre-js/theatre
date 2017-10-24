// @flow
import * as React from 'react'

type Props = {
  children: any,
  onDragStart?: Function,
  onDragEnd?: Function,
  onDrag?: Function,
}

type State = {
  isDragging: boolean,
  startPos: {
    x: number,
    y: number,
  },
}

class DraggableArea extends React.Component<Props, State> {
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

  componentWillUnmount() {
    this.removeDragListeners()
  }

  addDragListeners() {
    document.addEventListener('mousemove', this.dragHandler)
    document.addEventListener('mouseup', this.dragEndHandler)
  }

  removeDragListeners() {
    document.removeEventListener('mousemove', this.dragHandler)
    document.removeEventListener('mouseup', this.dragEndHandler)
  }

  dragStartHandler = (e: SyntheticMouseEvent<*>) => {
    if (e.button !== 0) return

    const {screenX, screenY} = e
    this.setState(() => ({
      startPos: {x: screenX, y: screenY},
    }))

    this.addDragListeners()
    this.props.onDragStart && this.props.onDragStart()
  }

  dragEndHandler = () => {
    this.removeDragListeners()
    if (this.state.isDragging) {
      this.setState(() => ({isDragging: false}))
      this.props.onDragEnd && this.props.onDragEnd()
    }
  }

  dragHandler = (e: MouseEvent) => {
    if (!this.state.isDragging) this.setState(() => ({isDragging: true}))

    const {startPos} = this.state
    this.props.onDrag && this.props.onDrag(e.screenX - startPos.x, e.screenY - startPos.y, e)
  }

  render() {
    return (
      React.cloneElement(this.props.children, {onMouseDown: this.dragStartHandler})
    )
  }
}

export default DraggableArea