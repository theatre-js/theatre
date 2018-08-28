import React from 'react'

export default class RenderBlocker extends React.Component<{}, {}> {
  shouldComponentUpdate() {
    return false
  }

  render() {
    return this.props.children
  }
}
