// @flow
import createSagaMiddleware from 'redux-saga'
import {applyMiddleware, createStore, compose} from 'redux'

export default function dummySagaRunner() {

  const sagaMiddleware = createSagaMiddleware()
  const store = createStore((s = {}) => s, undefined, applyMiddleware(sagaMiddleware))
  return sagaMiddleware
}