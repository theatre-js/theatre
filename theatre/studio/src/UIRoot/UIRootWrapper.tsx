import type Studio from '@theatre/studio/Studio'
import React from 'react'
import UIRoot from './UIRoot'

export default class UIRootWrapper extends React.Component<{
  studio: Studio
}> {
  state = {UIRoot}
  componentDidMount() {
    const self = this
    if (
      $env.NODE_ENV === 'development' &&
      typeof module === 'object' &&
      module &&
      module.hot
    ) {
      module.hot.accept('./UIRoot', () => {
        const UIRoot = require('./UIRoot').default
        self.setState({UIRoot})
      })
    }
  }
  render() {
    const UIRoot = this.state.UIRoot
    const rootEl = <UIRoot studio={this.props.studio} />
    return rootEl
  }
}
