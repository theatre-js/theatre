// @flow
// import {StoreState} from '$studio/types'
import originalConnect from 'react-redux/es/connect/connect'
// import {HigherOrderComponent} from 'react-flow-types'
import {StoreState} from '$lf/types'

export const storeKey = 'theaterJSReduxStore'

const connect = (mapStateToProps: mixed) => {
  return originalConnect(mapStateToProps, undefined, undefined, {storeKey})
}

type SelectorFn<P> = (storeState: StoreState, ownProps?: $FixMe) => P

type ConnectFn = <ProvidedProps>(
  selectorFn: SelectorFn<ProvidedProps>,
) => HigherOrderComponent<{}, {}>

export default ((connect as any) as ConnectFn)
