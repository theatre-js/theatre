import {Ticker} from '@theatre/dataverse'

const {ticker, enableTicker, disableTicker} = Ticker.stoppableRaf

export default ticker
export {enableTicker, disableTicker}
