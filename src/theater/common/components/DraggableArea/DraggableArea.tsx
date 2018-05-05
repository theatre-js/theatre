import React from 'react'

type Props = {
  children: any
  onDragStart?: (event: MouseEvent) => void
  onDragEnd?: (dragHappened: boolean) => void
  onDrag?: (dx: number, dy: number, event: MouseEvent) => void
  shouldRegisterEvents?: boolean
}

type State = {
  dragHappened: boolean
  startPos: {
    x: number
    y: number
  }
}

class DraggableArea extends React.PureComponent<Props, {}> {
  s: State
  constructor(props: Props) {
    super(props)
    this.s = {
      dragHappened: false,
      startPos: {
        x: 0,
        y: 0,
      },
    }
  }

  addDragListeners() {
    document.addEventListener('mousemove', this.dragHandler)
    document.addEventListener('mouseup', this.dragEndHandler)
  }

  removeDragListeners() {
    document.removeEventListener('mousemove', this.dragHandler)
    document.removeEventListener('mouseup', this.dragEndHandler)
  }

  dragStartHandler = (e: MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const {screenX, screenY} = e
    this.s.startPos = {x: screenX, y: screenY}

    this.addDragListeners()
    this.props.onDragStart && this.props.onDragStart(e)
  }

  dragEndHandler = () => {
    this.removeDragListeners()

    this.props.onDragEnd && this.props.onDragEnd(this.s.dragHappened)
  }

  dragHandler = (e: MouseEvent) => {
    if (!this.s.dragHappened) this.s.dragHappened = true

    const {startPos} = this.s
    this.props.onDrag &&
      this.props.onDrag(e.screenX - startPos.x, e.screenY - startPos.y, e)
  }

  render() {
    const shouldRegisterEvents =
      this.props.shouldRegisterEvents != null
        ? this.props.shouldRegisterEvents
        : true
    return shouldRegisterEvents
      ? React.cloneElement(this.props.children, {
          onMouseDown: this.dragStartHandler,
        })
      : this.props.children
  }
}

export default DraggableArea
