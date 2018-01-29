// @ts-ignore
import originalConnect from 'react-redux/es/connect/connect'
import {IStoreState} from '$studio/types'

export const storeKey = 'theaterJSReduxStore'

const connect = (mapStateToProps: mixed) => {
  return originalConnect(mapStateToProps, undefined, undefined, {storeKey})
}

type SelectorFn<P> = (storeState: IStoreState, ownProps: $FixMe) => P

type ConnectFn = <ProvidedProps extends {}>(
  selectorFn: SelectorFn<ProvidedProps>,
) => <T extends Object>(t: T) => T

export default (connect as any) as ConnectFn
