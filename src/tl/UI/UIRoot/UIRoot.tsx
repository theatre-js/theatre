import React from 'react'
import * as css from './UIRoot.css'
import UI from '../UI'
import PropTypes from 'prop-types'

interface IProps {
  ui: UI
}

export default class UIRoot extends React.Component<IProps, {}> {
  render() {
    const shouldShowTrigger = true
    return (
      <div className={css.container}>
        {shouldShowTrigger && <button className={css.trigger}>T</button>}
      </div>
    )
  }

  getChildContext() {
    return {ui: this.props.ui}
  }
  
  static childContextTypes = {
    ui: PropTypes.any,
  }
}
