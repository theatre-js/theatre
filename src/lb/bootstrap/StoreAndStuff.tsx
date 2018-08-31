import {applyMiddleware, createStore, compose, Reducer, Store} from 'redux'
import {call} from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'
import {identity} from 'lodash-es'

type RootSagaShape = (...args: mixed[]) => Generator_<mixed, mixed, mixed>

type ConstructorProps<State, RootSaga> = {
  initialState?: State
  rootSaga: RootSaga
  rootReducer: Reducer<State>
}

/**
 * StoreAndStuff is basically just a standard configuration of redux store and sagas. Nothing special really.
 */
export default class StoreAndStuff<State, RootSaga extends RootSagaShape> {
  sagaMiddleware: $FixMe
  _initialState: undefined | null | State
  rootReducer: Reducer<State>
  reduxStore: Store<State>
  rootSaga: RootSaga

  constructor({
    initialState,
    rootReducer,
    rootSaga,
  }: ConstructorProps<State, RootSaga>) {
    this._initialState = initialState
    this.sagaMiddleware = createSagaMiddleware()

    this.rootSaga = rootSaga
    this.rootReducer = rootReducer

    this.reduxStore = this._createReduxStore()
  }

  _createReduxStore(): Store<State> {
    const middlewares = []

    middlewares.push(this.sagaMiddleware)

    const enhancer = compose(
      applyMiddleware(...middlewares),
      typeof window === 'object' && window.devToolsExtension
        ? window.devToolsExtension()
        : identity,
    )

    const store = createStore(
      this.rootReducer,
      this._initialState || (undefined as $FixMe),
      enhancer,
    )

    // @ts-ignore ignore
    store.sagaMiddleware = this.sagaMiddleware

    return store
  }

  runRootSaga(arg?: mixed) {
    return this.sagaMiddleware.run(this.rootSaga, arg)
  }

  runSaga: RunSagaFn = (
    fn: $IntentionalAny,
    ...args: $IntentionalAny[]
  ): Promise<$FixMe> => {
    // @ts-ignore ignore
    return this.reduxStore.sagaMiddleware.run(preventToThrow(fn), ...args).done
  }
}

function preventToThrow(fn: () => Generator_<$FixMe>) {
  return function* callAndCatch(
    ...args: $IntentionalAny[]
  ): Generator_<$FixMe> {
    try {
      // @ts-ignore
      return yield call(fn, ...args)
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

type Fn0<R> = () => Generator_<mixed, R, mixed>
type Fn1<T1, R> = (t1: T1) => Generator_<mixed, R, mixed>
type Fn2<T1, T2, R> = (t1: T1, t2: T2) => Generator_<mixed, R, mixed>
type Fn3<T1, T2, T3, R> = (
  t1: T1,
  t2: T2,
  t3: T3,
) => Generator_<mixed, R, mixed>
type Fn4<T1, T2, T3, T4, R> = (
  t1: T1,
  t2: T2,
  t3: T3,
  t4: T4,
) => Generator_<mixed, R, mixed>
type Fn5<T1, T2, T3, T4, T5, R> = (
  t1: T1,
  t2: T2,
  t3: T3,
  t4: T4,
  t5: T5,
) => Generator_<mixed, R, mixed>
type Fn6<T1, T2, T3, T4, T5, T6, R> = (
  t1: T1,
  t2: T2,
  t3: T3,
  t4: T4,
  t5: T5,
  t6: T6,
) => Generator_<mixed, R, mixed>

export type RunSagaFn = (<
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  R,
  Fn extends Fn6<T1, T2, T3, T4, T5, T6, R>
>(
  fn: Fn,
  t1: T1,
  t2: T2,
  t3: T3,
  t4: T4,
  t5: T5,
  t6: T6,
) => Promise<R>) &
  (<T1, T2, T3, T4, T5, R, Fn extends Fn5<T1, T2, T3, T4, T5, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    t3: T3,
    t4: T4,
    t5: T5,
  ) => Promise<R>) &
  (<T1, T2, T3, T4, R, Fn extends Fn4<T1, T2, T3, T4, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    t3: T3,
    t4: T4,
  ) => Promise<R>) &
  (<T1, T2, T3, R, Fn extends Fn3<T1, T2, T3, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    t3: T3,
  ) => Promise<R>) &
  (<T1, T2, R, Fn extends Fn2<T1, T2, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
  ) => Promise<R>) &
  (<T1, R, Fn extends Fn1<T1, R>>(fn: Fn, t1: T1) => Promise<R>) &
  (<R, Fn extends Fn0<R>>(fn: Fn) => Promise<R>)
