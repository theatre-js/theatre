import React from 'react'
import Ticker from '$shared/DataVerse/Ticker'
import PropTypes from 'prop-types'

export const tickerContextName = '@@studio/ticker'
export const tickerContextTypes = {
  [tickerContextName]: PropTypes.any,
}

export const getTicker = (context: $IntentionalAny): Ticker => {
  return context[tickerContextName]
}

export const TickerContext = React.createContext<Ticker>(
  null as $IntentionalAny,
)

export class TickerProvider extends React.Component<{
  ticker: Ticker
  children: React.ReactNode
}> {
  getChildContext() {
    return {[tickerContextName]: this.props.ticker}
  }

  static childContextTypes = tickerContextTypes

  render() {
    return (
      <TickerContext.Provider value={this.props.ticker}>
        this.props.children
      </TickerContext.Provider>
    )
  }
}
