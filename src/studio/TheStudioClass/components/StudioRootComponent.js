// @flow

import HotReloadablePart from './HotReloadablePart'
import {AppContainer} from 'react-hot-loader'
import compose from 'ramda/src/compose'
import './StudioRootComponent.css'
import * as React from 'react'
import TheStudioClass from '$studio/TheStudioClass'
import {contextName, contextTypes} from '$studio/componentModel/react/studioContext'

type Props = {
  studio: TheStudioClass,
}

type State = {
  HotReloadablePart: typeof HotReloadablePart,
}

class StudioRootComponent extends React.Component<Props, *> {
  state: State
  static childContextTypes = contextTypes

  constructor(props: Props) {
    super(props)

    this.state = {
      HotReloadablePart,
    }
  }

  getChildContext() {
    return {
      [contextName]: this.props.studio,
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
        <HotReloadablePart />
      </AppContainer>
    )
  }
}

export default compose(
  (a) => a
)(StudioRootComponent)