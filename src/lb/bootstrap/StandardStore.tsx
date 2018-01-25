// @flow
import {
  applyMiddleware,
  createStore,
  compose,
  Reducer,
  Store,
} from 'redux'
import {call} from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'

type RootSaga<State, Action> = (
  store: StandardStore<State, Action>,
) => Generator_<mixed, mixed, mixed>
type ConstructorProps<State, Action> = {
  initialState?: State,
  rootSaga: RootSaga<State, Action>,
  rootReducer: Reducer<State, Action>,
}

/**
 * StandardStore is basically just a standard configuration of redux store and sagas. Nothing special really.
 */
export default class StandardStore<State: Object, Action: Object> {
  sagaMiddleware: *
  _initialState: undefined | null | State
  rootReducer: Reducer<State, Action>
  reduxStore: Store<State, Action>
  rootSaga: RootSaga<State, Action>

  constructor({
    initialState,
    rootReducer,
    rootSaga,
  }: ConstructorProps<State, Action>) {
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
      typeof window === 'object' && window.devToolsExtension
        ? window.devToolsExtension()
        : f => f,
    )

    const store = createStore(
      this.rootReducer,
      this._initialState || (undefined: $FixMe),
      enhancer,
    )

    // $FixMe
    store.sagaMiddleware = this.sagaMiddleware

    return store
  }

  runRootSaga() {
    return this.sagaMiddleware.run(this.rootSaga, this)
  }

  runSaga: RunSagaFn = (fn: $IntentionalAny, ...args): $FixMe => {
    // $FlowIgnore
    return this.reduxStore.sagaMiddleware.run(preventToThrow(fn), ...args).done
  }
}

function preventToThrow(fn: () => Generator_<*, *, *>) {
  return function* callAndCatch(...args): Generator_<*, *, *> {
    try {
      return yield call(fn, ...args)
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

type Fn0<R> = (...rest: Array<void>) => Generator_<mixed, R, mixed>
type Fn1<T1, R> = (t1: T1, ...rest: Array<void>) => Generator_<mixed, R, mixed>
type Fn2<T1, T2, R> = (
  t1: T1,
  t2: T2,
  ...rest: Array<void>
) => Generator_<mixed, R, mixed>
type Fn3<T1, T2, T3, R> = (
  t1: T1,
  t2: T2,
  t3: T3,
  ...rest: Array<void>
) => Generator_<mixed, R, mixed>
type Fn4<T1, T2, T3, T4, R> = (
  t1: T1,
  t2: T2,
  t3: T3,
  t4: T4,
  ...rest: Array<void>
) => Generator_<mixed, R, mixed>
type Fn5<T1, T2, T3, T4, T5, R> = (
  t1: T1,
  t2: T2,
  t3: T3,
  t4: T4,
  t5: T5,
  ...rest: Array<void>
) => Generator_<mixed, R, mixed>
type Fn6<T1, T2, T3, T4, T5, T6, R> = (
  t1: T1,
  t2: T2,
  t3: T3,
  t4: T4,
  t5: T5,
  t6: T6,
  ...rest: Array<void>
) => Generator_<mixed, R, mixed>

export type RunSagaFn = (<
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  R,
  Fn: Fn6<T1, T2, T3, T4, T5, T6, R>,
>(
  fn: Fn,
  t1: T1,
  t2: T2,
  t3: T3,
  t4: T4,
  t5: T5,
  t6: T6,
  ...rest: Array<void>
) => Promise<R>) &
  (<T1, T2, T3, T4, T5, R, Fn: Fn5<T1, T2, T3, T4, T5, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    t3: T3,
    t4: T4,
    t5: T5,
    ...rest: Array<void>
  ) => Promise<R>) &
  (<T1, T2, T3, T4, R, Fn: Fn4<T1, T2, T3, T4, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    t3: T3,
    t4: T4,
    ...rest: Array<void>
  ) => Promise<R>) &
  (<T1, T2, T3, R, Fn: Fn3<T1, T2, T3, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    t3: T3,
    ...rest: Array<void>
  ) => Promise<R>) &
  (<T1, T2, R, Fn: Fn2<T1, T2, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    ...rest: Array<void>
  ) => Promise<R>) &
  (<T1, R, Fn: Fn1<T1, R>>(
    fn: Fn,
    t1: T1,
    ...rest: Array<void>
  ) => Promise<R>) &
  (<R, Fn: Fn0<R>>(fn: Fn, ...rest: Array<void>) => Promise<R>)
