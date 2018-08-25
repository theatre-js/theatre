import ReactDOM from 'react-dom'
import React from 'react'
import css from './FixedFullSizePortal.css'
import {resolveCss} from '$shared/utils'

const classes = resolveCss(css)

class FixedFullSizePortal extends React.PureComponent<{}, {}> {
  render() {
    return ReactDOM.createPortal(
      <div {...classes('container')}>{this.props.children}</div>,
      document.querySelector('.theaterjsRoot') as HTMLElement,
    )
  }
}

export default FixedFullSizePortal
