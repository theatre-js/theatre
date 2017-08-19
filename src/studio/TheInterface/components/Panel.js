// @flow
import React from 'react'
import css from './Panel.css'
import Settings from './Settings'

type Props = {
  children: any,
}

type State = {
  isInSettings: boolean,
}

class Panel extends React.Component {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)
    this.state = {
      isInSettings: false,
    }
  }

  toggleSettings = () => {
    this.setState((state) => ({isInSettings: !state.isInSettings}))
  }

  render() {
    const {children} = this.props
    const {isInSettings} = this.state

    return (
      <div className={css.container}>
        <div className={css.topBar}>
          <div
            className={css.settings}
            onClick={this.toggleSettings}>
            {isInSettings ? 'Confirm Settings' : 'Show Settings'}
          </div>
        </div>
        <div className={css.content}>
          {isInSettings ? <Settings /> : children}
        </div>
      </div>
    )
  }
}

export default Panel