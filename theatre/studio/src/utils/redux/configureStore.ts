import type {
  $FixMe,
  $IntentionalAny,
  ReduxReducer,
} from '@theatre/shared/utils/types'
import identity from 'lodash-es/identity'
import type {Store} from 'redux'
import {compose, createStore} from 'redux'

interface Conf<State> {
  rootReducer: ReduxReducer<State>
  devtoolsOptions?: $FixMe
}

export default function configureStore<State>(conf: Conf<State>): Store<State> {
  // const middlewares: $FixMe[] = []
  const enhancers = []

  if (process.env.NODE_ENV !== 'production') {
    const devtoolsEnhancer: $IntentionalAny =
      process.env.NODE_ENV !== 'production' &&
      typeof window === 'object' &&
      window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__(conf.devtoolsOptions)
        : identity

    enhancers.push(devtoolsEnhancer)
  }

  // enhancers.unshift(applyMiddleware(...middlewares))

  const enhancer = compose(...enhancers)

  const store = createStore(
    conf.rootReducer as $IntentionalAny,
    undefined,
    enhancer as $IntentionalAny,
  )

  return store as $IntentionalAny as Store<State>
}
