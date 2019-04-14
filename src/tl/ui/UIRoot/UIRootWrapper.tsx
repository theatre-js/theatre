import React from 'react'
import UIRoot from './UIRoot'
import UI from '$tl/ui/UI'

export default class UIRootWrapper extends React.Component<{ui: UI}> {
  state = {UIRoot}
  componentWillMount() {
    const self = this
    // @ts-ignore
    if ($env.NODE_ENV === 'development' && module && module.hot) {
      // @ts-ignore
      module.hot.accept('./UIRoot', () => {
        const UIRoot = require('./UIRoot').default
        self.setState({UIRoot})
      })
    }
  }
  render() {
    const UIRoot = this.state.UIRoot
    const rootEl = <UIRoot ui={this.props.ui} />
    return rootEl
  }
}
