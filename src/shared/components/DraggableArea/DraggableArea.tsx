import React from 'react'

type Props = {
  children: React.ReactElement<HTMLElement | SVGElement>
  onDragStart?: (event: React.MouseEvent<HTMLElement | SVGElement>) => void
  onDragEnd?: (dragHappened: boolean) => void
  onDrag: (dx: number, dy: number, event: MouseEvent) => void
  shouldRegisterEvents?: boolean
  shouldReturnMovement?: boolean
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
  getDeltas: (e: MouseEvent) => [number, number]

  constructor(props: Props) {
    super(props)
    this.s = {
      dragHappened: false,
      startPos: {
        x: 0,
        y: 0,
      },
    }
    if (props.shouldReturnMovement) {
      this.getDeltas = this.getMovements
    } else {
      this.getDeltas = this.getDistances
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

  dragStartHandler = (e: React.MouseEvent<HTMLElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const {screenX, screenY} = e
    this.s.startPos = {x: screenX, y: screenY}
    this.s.dragHappened = false

    this.addDragListeners()
    this.props.onDragStart && this.props.onDragStart(e)
  }

  dragEndHandler = () => {
    this.removeDragListeners()

    this.props.onDragEnd && this.props.onDragEnd(this.s.dragHappened)
  }

  dragHandler = (e: MouseEvent) => {
    if (!this.s.dragHappened) this.s.dragHappened = true

    // const {startPos} = this.s
    const deltas = this.getDeltas(e)
    this.props.onDrag(deltas[0], deltas[1], e)
    // this.props.onDrag(e.screenX - startPos.x, e.screenY - startPos.y, e)
  }

  getDistances(e: MouseEvent): [number, number] {
    const {startPos} = this.s
    return [e.screenX - startPos.x, e.screenY - startPos.y]
  }

  getMovements(e: MouseEvent): [number, number] {
    return [e.movementX, e.movementY]
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
