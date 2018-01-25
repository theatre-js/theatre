// @flow

import StandardStore from '$lb/bootstrap/StandardStore'
import rootReducer from '$lb/bootstrap/rootReducer'
// import rootSaga from '$lb/bootstrap/rootSaga'
import {StoreState} from '$lb/types'

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

type Return<R> = {
  store: StandardStore<StoreState, any>,
  task: {done: Promise<R>},
}

export type RunSingleSagaFn = (<
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
) => Return<R>) &
  (<T1, T2, T3, T4, T5, R, Fn: Fn5<T1, T2, T3, T4, T5, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    t3: T3,
    t4: T4,
    t5: T5,
    ...rest: Array<void>
  ) => Return<R>) &
  (<T1, T2, T3, T4, R, Fn: Fn4<T1, T2, T3, T4, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    t3: T3,
    t4: T4,
    ...rest: Array<void>
  ) => Return<R>) &
  (<T1, T2, T3, R, Fn: Fn3<T1, T2, T3, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    t3: T3,
    ...rest: Array<void>
  ) => Return<R>) &
  (<T1, T2, R, Fn: Fn2<T1, T2, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    ...rest: Array<void>
  ) => Return<R>) &
  (<T1, R, Fn: Fn1<T1, R>>(fn: Fn, t1: T1, ...rest: Array<void>) => Return<R>) &
  (<R, Fn: Fn0<R>>(fn: Fn, ...rest: Array<void>) => Return<R>)

export const runSingleSaga: RunSingleSagaFn = (
  customRootSaga: $IntentionalAny,
  ...args: $IntentionalAny
): $IntentionalAny => {
  const store = new StandardStore({
    rootReducer,
    rootSaga: (null: $IntentionalAny),
  })

  return {store, task: store.sagaMiddleware.run(customRootSaga, ...args)}
}
