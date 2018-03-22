import {select} from 'redux-saga/effects'
import {LBStoreState} from '$lb/types'

export default function* getCurrentState(): Generator_<LBStoreState> {
  return yield select()
}
