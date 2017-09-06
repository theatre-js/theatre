// @flow
import * as React from 'react'
import {storeKey} from '$studio/common/utils/connect'
import {createProvider} from 'react-redux/es/components/Provider'
import {type Store} from 'redux'
import RenderCanvas from './RenderCanvas'

const ReduxStoreProvider = createProvider(storeKey)

type Props = {
  children: React.Node,
}

export default (store: Store<any, any, any>) => {
  const TheaterJSRoot = (props: Props) => {
    return <ReduxStoreProvider store={store}>
      <RenderCanvas>{props.children}</RenderCanvas>
    </ReduxStoreProvider>
  }

  return TheaterJSRoot
}