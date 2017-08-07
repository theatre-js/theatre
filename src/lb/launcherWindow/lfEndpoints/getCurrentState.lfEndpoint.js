// @flow
import {select} from 'redux-saga/effects'
import {type StoreState} from '$lb/types'

export default function* getCurrentState(): Generator<*, StoreState, *> {
  return yield select()
}