import HotReloadablePart from './HotReloadablePart'
import {createProvider} from 'react-redux'
import {AppContainer} from 'react-hot-loader'
import {compose} from 'ramda'
import './StudioRootComponent.css'
import * as React from 'react'
import Studio from '$studio/bootstrap/Studio'
import {storeKey} from '$studio/handy/connect'
import {
  contextName,
  contextTypes,
} from '$src/studio/componentModel/react/utils/studioContext'

const StoreProvider = createProvider(storeKey)

type Props = {
  studio: Studio
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

    if (process.env.NODE_ENV === 'development' && module.hot) {
      module.hot.accept('./HotReloadablePart', () => {
        const HotReloadablePart = require('./HotReloadablePart').default
        self.setState({HotReloadablePart})
      })
    }
  }

  render() {
    const {HotReloadablePart} = this.state
    return (
      <AppContainer warnings={true}>
        <StoreProvider store={this.props.studio.store.reduxStore}>
          <HotReloadablePart />
        </StoreProvider>
      </AppContainer>
    )
  }

  getChildContext() {
    return {[contextName]: this.props.studio}
  }

  static childContextTypes = contextTypes
}

export default StudioRootComponent
