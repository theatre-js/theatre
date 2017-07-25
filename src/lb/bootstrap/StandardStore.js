// @flow
import {applyMiddleware, createStore, compose, type Reducer, type Store} from 'redux'
import createSagaMiddleware from 'redux-saga'

type RootSaga<State, Action> = (core: Core<State, Action>) => Generator<mixed, mixed, mixed>
type ConstructorProps<State, Action> = {
  initialState?: State,
  rootSaga: RootSaga<State, Action>,
  rootReducer: Reducer<State, Action>,
}

/**
 * StandardStore is basically just a standard configuration of redux store and sagas. Nothing special really.
 */
export default class Core<State: Object, Action: Object> {
  sagaMiddleware: *
  _initialState: ?State
  rootReducer: Reducer<State, Action>
  reduxStore: Store<State, Action>
  rootSaga: RootSaga<State, Action>

  constructor({initialState, rootReducer, rootSaga}: ConstructorProps<State, Action>) {
    this._initialState = initialState
    this.sagaMiddleware = createSagaMiddleware()

    this.rootSaga = rootSaga
    this.rootReducer = rootReducer

    this.reduxStore = this._createReduxStore()
  }

  _createReduxStore(): Store<State, Action> {
    const middlewares = []

    middlewares.push(this.sagaMiddleware)

    const enhancer = compose(
      applyMiddleware(...middlewares),
      (typeof window === 'object' && window.devToolsExtension) ? window.devToolsExtension() : (f) => f
    )

    const store = createStore(this.rootReducer, this._initialState || (undefined: $FlowFixMe), enhancer)

    // $FlowFixMe
    store.sagaMiddleware = this.sagaMiddleware

    return store
  }

  runRootSaga() {
    return this.sagaMiddleware.run(this.rootSaga, this)
  }
}