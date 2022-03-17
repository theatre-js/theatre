import {defaultTickerFactory} from '@theatre/dataverse'

const {ticker, enableDefaultTicker, disableDefaultTicker} =
  defaultTickerFactory()

export default ticker
export {enableDefaultTicker, disableDefaultTicker}
