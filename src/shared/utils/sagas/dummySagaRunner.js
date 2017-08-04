// @flow
import createSagaMiddleware from 'redux-saga'
import {applyMiddleware, createStore} from 'redux'

export default function dummySagaRunner() {

  const sagaMiddleware = createSagaMiddleware()
  createStore((s = {}) => s, undefined, applyMiddleware(sagaMiddleware))
  return sagaMiddleware
}