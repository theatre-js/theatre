import {voidFn} from '@theatre/shared/utils'
import React from 'react'

function createCursorLock(cursor: string) {
  const el = document.createElement('div')
  el.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9999999;`

  el.style.cursor = cursor
  document.body.appendChild(el)
  const relinquish = () => {
    document.body.removeChild(el)
  }

  return relinquish
}

type IProps = {
  children: React.ReactElement<HTMLElement | SVGElement>
  onDragStart?: (
    event: React.MouseEvent<HTMLElement | SVGElement>,
  ) => void | false
  onDragEnd?: (dragHappened: boolean) => void
  onDrag: (dx: number, dy: number, event: MouseEvent) => void
  enabled?: boolean
  shouldReturnMovement?: boolean
  dontBlockMouseDown?: boolean
  lockCursorTo?: string
}

type State = {
  dragHappened: boolean
  startPos: {
    x: number
    y: number
  }
}

/**
 * TODO low-hanging-fruit replace all DraggableArea instances with `react-use-gesture`
 */
class DraggableArea extends React.PureComponent<IProps, {}> {
  s: State
  mode: 'dragStartCalled' | 'dragging' | 'notDragging' = 'notDragging'
  getDeltas: (e: MouseEvent) => [number, number]
  relinquishCursorLock: () => void = voidFn

  constructor(props: IProps) {
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

  render() {
    const shouldRegisterEvents = this.props.enabled !== false

    const children = shouldRegisterEvents
      ? React.cloneElement(this.props.children, {
          onMouseDown: this.dragStartHandler,
          onClickCapture: this.disableUnwantedClick,
        })
      : this.props.children

    return children
  }

  addDragListeners() {
    document.addEventListener('mousemove', this.dragHandler)
    document.addEventListener('mouseup', this.dragEndHandler)
  }

  removeDragListeners() {
    document.removeEventListener('mousemove', this.dragHandler)
    document.removeEventListener('mouseup', this.dragEndHandler)
  }

  disableUnwantedClick = (event: MouseEvent) => {
    if (this.s.dragHappened) {
      if (!this.props.dontBlockMouseDown && this.mode !== 'notDragging') {
        event.stopPropagation()
        event.preventDefault()
      }
      this.s.dragHappened = false
    }
  }

  UNSAFE_componentWillReceiveProps(newProps: IProps) {
    if (
      newProps.lockCursorTo !== this.props.lockCursorTo &&
      this.s.dragHappened
    ) {
      this.relinquishCursorLock()
      this.relinquishCursorLock = voidFn
      if (newProps.lockCursorTo) {
        this.relinquishCursorLock = createCursorLock(newProps.lockCursorTo)
      }
    }
  }

  dragStartHandler = (event: React.MouseEvent<HTMLElement>) => {
    if (event.button !== 0) return
    const resultOfStart =
      this.props.onDragStart && this.props.onDragStart(event)

    if (resultOfStart === false) return

    if (!this.props.dontBlockMouseDown) {
      event.stopPropagation()
      event.preventDefault()
    }

    this.mode = 'dragStartCalled'

    const {screenX, screenY} = event
    this.s.startPos = {x: screenX, y: screenY}
    this.s.dragHappened = false

    this.addDragListeners()
  }

  dragEndHandler = () => {
    this.removeDragListeners()
    this.mode = 'notDragging'

    this.props.onDragEnd && this.props.onDragEnd(this.s.dragHappened)
    this.relinquishCursorLock()
    this.relinquishCursorLock = voidFn
  }

  dragHandler = (event: MouseEvent) => {
    if (!this.s.dragHappened && this.props.lockCursorTo) {
      this.relinquishCursorLock = createCursorLock(this.props.lockCursorTo)
    }
    if (!this.s.dragHappened) this.s.dragHappened = true
    this.mode = 'dragging'

    const deltas = this.getDeltas(event)
    this.props.onDrag(deltas[0], deltas[1], event)
  }

  getDistances(event: MouseEvent): [number, number] {
    const {startPos} = this.s
    return [event.screenX - startPos.x, event.screenY - startPos.y]
  }

  getMovements(event: MouseEvent): [number, number] {
    return [event.movementX, event.movementY]
  }

  componentWillUnmount() {
    if (this.mode !== 'notDragging') {
      this.relinquishCursorLock()
      this.relinquishCursorLock = voidFn
      this.removeDragListeners()
      this.props.onDragEnd && this.props.onDragEnd(this.mode === 'dragging')
      this.mode = 'notDragging'
    }
  }
}

export default DraggableArea
