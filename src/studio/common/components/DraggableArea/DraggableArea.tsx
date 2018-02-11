import * as React from 'react'

type Props = {
  children: any,
  withShift?: boolean,
  onDragStart?: Function,
  onDragEnd?: Function,
  onDrag?: Function,
  shouldRegisterEvents?: boolean,
}

type State = {
  dragHappened: boolean,
  startPos: {
    x: number,
    y: number,
  },
  dragStartTime: number,
}

class DraggableArea extends React.Component<Props, {}> {
  s: State
  constructor(props: Props) {
    super(props)
    this.s = {
      dragHappened: false,
      dragStartTime: 0,
      startPos: {
        x: 0,
        y: 0,
      },
    }
  }

  // componentWillUnmount() {
  //   this.removeDragListeners()
  // }

  addDragListeners() {
    document.addEventListener('mousemove', this.dragHandler)
    document.addEventListener('mouseup', this.dragEndHandler)
  }

  removeDragListeners() {
    document.removeEventListener('mousemove', this.dragHandler)
    document.removeEventListener('mouseup', this.dragEndHandler)
  }

  dragStartHandler = (e: SyntheticMouseEvent<*>) => {
    if (this.props.withShift && !e.shiftKey) return
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const {screenX, screenY} = e
    this.s.startPos = {x: screenX, y: screenY}
    this.s.dragStartTime = Date.now()
    // this.setState(() => ({
      // startPos: {x: screenX, y: screenY},
    // }))

    this.addDragListeners()
    this.props.onDragStart && this.props.onDragStart(e)
  }

  dragEndHandler = () => {
    this.removeDragListeners()

    this.props.onDragEnd && this.props.onDragEnd(this.s.dragHappened)
    // if (this.state.dragHappened) {
    //   this.setState(() => ({dragHappened: false}))
    // }
  }

  dragHandler = (e: MouseEvent) => {
    // if (!this.state.dragHappened) this.setState(() => ({dragHappened: true}))
    if (!this.s.dragHappened) this.s.dragHappened = true

    const {startPos} = this.s
    this.props.onDrag &&
      this.props.onDrag(e.screenX - startPos.x, e.screenY - startPos.y, e)
  }

  render() {
    const shouldRegisterEvents = (this.props.shouldRegisterEvents != null) ? this.props.shouldRegisterEvents : true
    return shouldRegisterEvents ? (
      React.cloneElement(this.props.children, {
        onMouseDown: this.dragStartHandler,
      })
    ) : (
      this.props.children
    )
      
  }
}

export default DraggableArea
