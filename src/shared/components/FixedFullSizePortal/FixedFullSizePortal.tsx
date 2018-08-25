import ReactDOM from 'react-dom'
import React from 'react'

const style: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  zIndex: 10000,
  pointerEvents: 'none',
}

class FixedFullSizePortal extends React.PureComponent<{}, {}> {
  render() {
    return ReactDOM.createPortal(
      <div style={style}>{this.props.children}</div>,
      document.querySelector('.theaterjsRoot') as HTMLElement,
    )
  }
}

export default FixedFullSizePortal
