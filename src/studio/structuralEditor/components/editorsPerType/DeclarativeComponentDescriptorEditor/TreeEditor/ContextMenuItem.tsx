import React from 'react'
import * as css from './ContextMenuItem.css'

type Props = {
  children: React.Node
  onClick: Function
}
type State = void

class ContextMenuItem extends React.Component<Props, State> {
  clickHandler = e => {
    e.stopPropagation()
    this.props.onClick()
  }

  render() {
    return (
      <div className={css.container} onClick={this.clickHandler}>
        {this.props.children}
      </div>
    )
  }
}

export default ContextMenuItem
