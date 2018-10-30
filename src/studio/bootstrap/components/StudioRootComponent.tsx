import HotReloadablePart from './HotReloadablePart'
import {createProvider} from 'react-redux'
import {AppContainer} from 'react-hot-loader'
import './StudioRootComponent.css'
import React from 'react'
import Theatre from '$studio/bootstrap/Theatre'
import {storeKey} from '$studio/handy/connect'
import {
  contextName,
  contextTypes,
} from '$studio/componentModel/react/utils/studioContext'
import {TickerProvider} from '$shared/utils/react/TickerContext'

const StoreProvider = createProvider(storeKey)

type Props = {
  studio: Theatre
}

type State = {
  HotReloadablePart: typeof HotReloadablePart
}

class StudioRootComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      HotReloadablePart,
    }
  }

  componentWillMount() {
    const self = this

    if ($env.NODE_ENV === 'development' && module.hot) {
      module.hot.accept('./HotReloadablePart', () => {
        const HotReloadablePart = require('./HotReloadablePart').default
        self.setState({HotReloadablePart})
      })
    }
  }

  render() {
    const {HotReloadablePart} = this.state
    return (
      <TickerProvider ticker={this.props.studio.ticker}>
        <AppContainer>
          <StoreProvider store={this.props.studio.store}>
            <HotReloadablePart />
          </StoreProvider>
        </AppContainer>
      </TickerProvider>
    )
  }

  getChildContext() {
    return {
      [contextName]: this.props.studio,
    }
  }

  static childContextTypes = contextTypes
}

export default StudioRootComponent
