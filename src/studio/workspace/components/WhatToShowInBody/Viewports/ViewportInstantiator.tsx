import React from 'react'
import clamp from '$shared/number/clamp'

interface IProps {
  x: number
  y: number
  createViewport: (boundingRect: TBoundingRect) => void
}

interface IState {
  deltaX: number
  deltaY: number
}

export type TBoundingRect = {
  left: number
  top: number
  width: number
  height: number
}

class ViewportInstantiator extends React.PureComponent<IProps, IState> {
  state = {
    deltaX: 0,
    deltaY: 0,
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.handleMouseUp)
    document.addEventListener('mousemove', this.handleMouseMove)
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleMouseUp)
    document.removeEventListener('mousemove', this.handleMouseMove)
  }

  private handleMouseMove = (e: MouseEvent) => {
    const {movementX, movementY} = e
    this.setState(({deltaX, deltaY}) => ({
      deltaX: deltaX + movementX,
      deltaY: deltaY + movementY,
    }))
  }

  private getBoundingRect(): TBoundingRect {
    const {deltaX, deltaY} = this.state
    return {
      left: this.props.x + clamp(deltaX, 0),
      top: this.props.y + clamp(deltaY, 0),
      width: Math.abs(deltaX),
      height: Math.abs(deltaY),
    }
  }

  private handleMouseUp = () => {
    this.props.createViewport(this.getBoundingRect())
  }

  render() {
    return (
      <div
        style={{
          background: 'white',
          position: 'absolute',
          ...this.getBoundingRect(),
        }}
      />
    )
  }
}

export default ViewportInstantiator
