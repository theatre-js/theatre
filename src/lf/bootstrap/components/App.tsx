import * as React from 'react'
import {AppContainer} from 'react-hot-loader'
import configureStore from '$lf/bootstrap/configureStore'
import {Provider as StoreProvider} from 'react-redux'
import './App.css'
import Store from '$lb/bootstrap/StoreAndStuff'
import HotReloadablePartOfApp from './HotReloadablePartOfApp'

type Props = {}

type State = {
  HotReloadablePartOfApp: typeof HotReloadablePartOfApp
  store: Store<any, any>
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      HotReloadablePartOfApp,
      store: configureStore(),
    }

    this.state.store.runRootSaga()
  }

  componentWillMount() {
    // @todo I'm doing this because for some reason, `this` doesn't get preserved
    // inside the following arrow function. But it should. Maybe a babel misconfig this is?
    const self = this

    if (process.env.NODE_ENV === 'development' && module.hot) {
      module.hot.accept('./HotReloadablePartOfApp', () => {
        const HotReloadablePartOfApp = require('./HotReloadablePartOfApp')
          .default
        self.setState({HotReloadablePartOfApp})
      })
    }
  }

  render() {
    const {HotReloadablePartOfApp} = this.state
    return (
      <AppContainer>
        <StoreProvider store={this.state.store.reduxStore}>
          <HotReloadablePartOfApp />
        </StoreProvider>
      </AppContainer>
    )
  }
}

export default App
