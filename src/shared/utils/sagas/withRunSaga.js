// @flow
import React from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import type {HigherOrderComponent} from 'react-flow-types'
import {PropTypes} from 'prop-types'
import {call} from 'redux-saga/effects'

function preventToThrow(fn: () => Generator<>) {
  return function* callAndCatch(...args): Generator<> {
    try {
      return yield call(fn, ...args)
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

declare type FnSpread<T, R> = (...args: Array<T>) => R | Promise<R>;

declare type Fn0<R> = () => R | Promise<R> | Generator<*,R,*>;
declare type Fn1<T1, R> = (t1: T1) => R | Promise<R> | Generator<*,R,*>;
declare type Fn2<T1, T2, R> = (t1: T1, t2: T2) => R | Promise<R> | Generator<*,R,*>;
declare type Fn3<T1, T2, T3, R> = (t1: T1, t2: T2, t3: T3) => R | Promise<R> | Generator<*,R,*>;
declare type Fn4<T1, T2, T3, T4, R> = (t1: T1, t2: T2, t3: T3, t4: T4) => R | Promise<R> | Generator<*,R,*>;
declare type Fn5<T1, T2, T3, T4, T5, R> = (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5) => R | Promise<R> | Generator<*,R,*>;
declare type Fn6<T1, T2, T3, T4, T5, T6, R> = (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6) => R | Promise<R> | Generator<*,R,*>;

export type RunSagaFn =
  & (<R, Fn: Fn0<R>>(fn: Fn) => Promise<R>)
  & (<T1, R, Fn: Fn1<T1, R>>(fn: Fn, t1: T1) => Promise<R>)
  & (<T1, T2, R, Fn: Fn2<T1, T2, R>>(fn: Fn, t1: T1, t2: T2) => Promise<R>)
  & (<T1, T2, T3, R, Fn: Fn3<T1, T2, T3, R>>(fn: Fn, t1: T1, t2: T2, t3: T3) => Promise<R>)
  & (<T1, T2, T3, T4, R, Fn: Fn4<T1, T2, T3, T4, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4) => Promise<R>)
  & (<T1, T2, T3, T4, T5, R, Fn: Fn5<T1, T2, T3, T4, T5, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5) => Promise<R>)
  & (<T1, T2, T3, T4, T5, T6, R, Fn: Fn6<T1, T2, T3, T4, T5, T6, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6) => Promise<R>)
  & (<T, R, Fn: FnSpread<T, R>>(fn: Fn, ...args: Array<T>) => Promise<R>)

export type WithRunSagaProps = {runSaga: RunSagaFn}

export default function withRunSaga(): HigherOrderComponent<{}, {runSaga: RunSagaFn}> {
  return function connectedToSagas(component: any): any {
    const finalComponent = (props: Object, {store}: {store: {runSaga: Function}}) => {
      const ownProps = {
        // $FlowFixMe
        runSaga: (fn, ...args) => store.sagaMiddleware.run(preventToThrow(fn), ...args).done,
      }
      return React.createElement(component, {...props, ...ownProps})
    }

    finalComponent.contextTypes = {
      store: PropTypes.any,
    }

    finalComponent.displayName =
      `withRunSaga(${component.displayName || component.name || 'Component'})`

    hoistNonReactStatics(finalComponent, component)

    return finalComponent
  }
}
