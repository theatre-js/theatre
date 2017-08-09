// @flow

import HotReloadablePart from './HotReloadablePart'
import {Provider as StoreProvider} from 'react-redux'
import Store from '$lb/bootstrap/StandardStore'
import {AppContainer} from 'react-hot-loader'
import compose from 'ramda/src/compose'
import './StudioRootComponent.css'
import React from 'react'

type Props = {
  store: Store<any, any>,
}

type State = {
  HotReloadablePart: typeof HotReloadablePart,
}

class StudioRootComponent extends React.Component<*, Props, *> {
  state: State

  constructor(props: Props) {
    super(props)

    this.state = {
      HotReloadablePart,
    }
  }

  componentWillMount() {
    const self = this

    if (process.env.NODE_ENV === 'development' && module.hot) {
      module.hot.accept(
        './HotReloadablePart',
        () => {
          const HotReloadablePart = require('./HotReloadablePart').default
          self.setState({HotReloadablePart})
        }
      )
    }
  }

  render() {
    const {HotReloadablePart} = this.state
    return (
      <AppContainer>
        <StoreProvider store={this.props.store.reduxStore}>
          <HotReloadablePart />
        </StoreProvider>
      </AppContainer>
    )
  }
}

export default compose(
  (a) => a
)(StudioRootComponent)
