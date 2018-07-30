import React from 'react'
import * as css from './UIRoot.css'
import UI from '../UI'
import PropTypes from 'prop-types'
import TheTrigger from './TheTrigger'
import {TickerProvider} from '$shared/utils/react/TickerContext'
import {val} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'

interface IProps {
  ui: UI
}

export default class UIRoot extends React.Component<IProps, {}> {
  render() {
    return (
      <TickerProvider ticker={this.props.ui.ticker}>
        <PropsAsPointer>
          {() => {
            const visiblityState = val(
              this.props.ui.atomP.ahistoric.visibilityState,
            )
            const shouldShowTrigger = visiblityState !== 'everythingIsHidden'

            const shouldShowPanels = visiblityState === 'everythingIsVisible'
            
            return (
              <div className={css.container}>
                {shouldShowTrigger && <TheTrigger />}
                {shouldShowPanels && val(this.props.ui.atomP.historic.foo)}
              </div>
            )
          }}
        </PropsAsPointer>
      </TickerProvider>
    )
  }

  getChildContext() {
    return {ui: this.props.ui}
  }

  static childContextTypes = {
    ui: PropTypes.any,
  }
}
