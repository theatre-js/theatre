import React, {useContext} from 'react'
import type {Ticker} from '@theatre/dataverse'
import {RAFTicker} from './RAFTicker'

const tickerContext = React.createContext<Ticker>(RAFTicker.DEFAULT)
export function useTicker() {
  return useContext(tickerContext)
}
export function ProvideTicker(
  props: React.PropsWithChildren<{ticker: Ticker}>,
) {
  return (
    <tickerContext.Provider value={props.ticker}>
      {props.children}
    </tickerContext.Provider>
  )
}
