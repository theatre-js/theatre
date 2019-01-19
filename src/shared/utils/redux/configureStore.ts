import {compose, applyMiddleware, createStore, Store} from 'redux'
import {identity} from '$shared/utils'
import {ReduxReducer} from '$shared/types'

interface Conf<State> {
  rootReducer: ReduxReducer<State>
  devtoolsOptions?: $FixMe
}

export default function configureStore<State>(conf: Conf<State>): Store<State> {
  const middlewares: $FixMe[] = []
  const enhancers = []

  if ($env.NODE_ENV === 'development') {
    const devtoolsEnhancer =
      $env.NODE_ENV === 'development' &&
      typeof window === 'object' &&
      window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__(conf.devtoolsOptions)
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
