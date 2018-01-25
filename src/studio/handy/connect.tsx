// @flow
import originalConnect from 'react-redux/es/connect/connect'
// import {type HigherOrderComponent} from 'react-flow-types'
import {type StoreState} from '$studio/types'

export const storeKey = 'theaterJSReduxStore'

const connect = (mapStateToProps: mixed) => {
  return originalConnect(mapStateToProps, undefined, undefined, {storeKey})
}

type SelectorFn<P: {}> = (storeState: StoreState, ownProps: $FixMe) => P

type ConnectFn = <ProvidedProps: {}>(
  selectorFn: SelectorFn<ProvidedProps>,
) => HigherOrderComponent<{}, ProvidedProps>

export default ((connect: any): ConnectFn)
