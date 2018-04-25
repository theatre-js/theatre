import React from 'react'
import * as css from './ContextMenu.css'

type Props = {
  menuProps: {
    left: number
    top: number
  }
  close: Function
  render: Function
}
type State = {
  offsetLeft: number
}

class ContextMenu extends React.Component<Props, State> {
  width = 150
  state = {
    offsetLeft: 0,
  }

  componentDidMount() {
    const {left} = this.props.menuProps
    const offsetLeft = window.innerWidth - (left + this.width)
    this.setState(() => ({offsetLeft: offsetLeft < 0 ? offsetLeft : 0}))
  }

  render() {
    const {menuProps: {left, top}, close, render} = this.props
    const {offsetLeft} = this.state

    return (
      <div className={css.container} onClick={close}>
        <div
          className={css.menu}
          style={{width: this.width, left: left + offsetLeft, top}}
        >
          {render()}
        </div>
      </div>
    )
  }
}

export default ContextMenu
