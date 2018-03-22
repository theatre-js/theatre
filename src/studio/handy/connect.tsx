// @ts-ignore
import originalConnect from 'react-redux/es/connect/connect'
import {Connect} from 'react-redux'

export const storeKey = 'theaterJSReduxStore'

const connect = (mapStateToProps: mixed) => {
  return originalConnect(mapStateToProps, undefined, undefined, {storeKey})
}

export default connect as Connect
