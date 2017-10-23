// @flow
import React from 'react'
import compose from 'ramda/src/compose'
// import {AppContainer} from 'react-hot-loader'
import './SampleApp.css'
import SamplePlayground from './playground/SamplePlayground'

// const AppContainer =

const TheaterJSRoot = window.TheaterJS.react.Root

type Props = {}

type State = {
  SamplePlayground: typeof SamplePlayground,
}

class SampleApp extends React.Component<Props, State> {
  state: State

  constructor(props: Props) {
    super(props)

    this.state = {
      SamplePlayground,
    }
  }

  componentWillMount() {
    // @todo I'm doing this because for some reason, `this` doesn't get preserved
    // inside the following arrow function. But it should. Maybe a babel misconfig this is?
    const self = this

    if (process.env.NODE_ENV === 'development' && module.hot) {
      module.hot.accept(
        './playground/SamplePlayground',
        () => {
          const SamplePlayground = require('./playground/SamplePlayground').default
          self.setState({SamplePlayground})
        }
      )
    }
  }

  render() {
    const {SamplePlayground} = this.state
    return (
      <div>
        <TheaterJSRoot>
          <SamplePlayground />
        </TheaterJSRoot>
      </div>
    )
  }
}

export default compose(
  (a) => a
)(SampleApp)
