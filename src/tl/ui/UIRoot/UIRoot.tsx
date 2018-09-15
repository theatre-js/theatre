import React from 'react'
import * as css from './UIRoot.css'
import UI from '../UI'
import PropTypes from 'prop-types'
import TheTrigger from './TheTrigger'
import {TickerProvider} from '$shared/utils/react/TickerContext'
import {val} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import AllInOnePanel from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import UIComponent from '$tl/ui/handy/UIComponent'
import EnsureProjectsDontHaveErrors from '$tl/ui/UIRoot/EnsureProjectsDontHaveErrors'

interface IProps {
  ui: UI
}

export default class UIRoot extends UIComponent<IProps, {}> {
  render() {
    return (
      <TickerProvider ticker={this.props.ui.ticker}>
        <PropsAsPointer>
          {() => {
            const visiblityState = val(
              this.props.ui.atomP.ahistoric.visibilityState,
            )
            const initialised = val(this.props.ui.atomP.ephemeral.initialised)
            const shouldShowTrigger = visiblityState === 'onlyTriggerIsVisible'

            const shouldShowPanels = visiblityState === 'everythingIsVisible'

            return (
              <EnsureProjectsDontHaveErrors>
                {!initialised ? null : (
                  <div className={css.container}>
                    {shouldShowTrigger && <TheTrigger />}
                    {shouldShowPanels && <AllInOnePanel />}
                  </div>
                )}
              </EnsureProjectsDontHaveErrors>
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
