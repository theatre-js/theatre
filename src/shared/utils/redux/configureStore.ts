import {compose, applyMiddleware, createStore, Store} from 'redux'
import {identity} from 'lodash'
import {ReduxReducer} from '$shared/types'

interface Conf<State> {
  rootReducer: ReduxReducer<State>
}

export default function configureStore<State>(conf: Conf<State>): Store<State> {
  const middlewares: $FixMe[] = []
  const enhancers = []

  if (process.env.NODE_ENV === 'development') {
    const devtoolsEnhancer =
      process.env.NODE_ENV === 'development' &&
      typeof window === 'object' &&
      window.devToolsExtension
        ? window.devToolsExtension()
        : identity

    enhancers.push(devtoolsEnhancer)
  }

  enhancers.unshift(applyMiddleware(...middlewares))

  const enhancer = compose(...enhancers)

  const store = createStore(
    conf.rootReducer,
    undefined,
    enhancer as $IntentionalAny,
  )

  return store as Store<State>
}
