import React from 'react'

interface IProps {
  x: number,
  y: number,
  createViewport: (width: number, height: number) => void
}

interface IState {
  width: number,
  height: number,
}

class ViewportInstantiator extends React.PureComponent<IProps, IState> {
  state = {
    width: 0,
    height: 0,
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
    this.setState(({width, height}) => ({
      width: width + movementX,
      height: height + movementY,
    }))
  }

  private handleMouseUp = () => {
    const {width, height} = this.state
    this.props.createViewport(width, height)
  }

  render() {
    return (
      <div style={{
        background: 'white',
        position: 'absolute',
        left: this.props.x,
        top: this.props.y,
        width: this.state.width,
        height: this.state.height,
      }} />
    )
  }
}

export default ViewportInstantiator
