// @flow

import HotReloadablePart from './HotReloadablePart'
// $FixMe
import {createProvider} from 'react-redux'
import {AppContainer} from 'react-hot-loader'
import compose from 'ramda/src/compose'
import './StudioRootComponent.css'
import * as React from 'react'
import type {default as TheStudioClass} from '$studio/TheStudioClass'
import {storeKey} from '$studio/handy/connect'

const StoreProvider = createProvider(storeKey)

type Props = {
  studio: TheStudioClass,
}

type State = {
  HotReloadablePart: typeof HotReloadablePart,
}

class StudioRootComponent extends React.Component<Props, *> {
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
      <AppContainer warnings={false}>
        <StoreProvider store={this.props.studio.store.reduxStore}>
          <HotReloadablePart />
        </StoreProvider>
      </AppContainer>
    )
  }
}

export default compose(
  (a) => a
)(StudioRootComponent)
