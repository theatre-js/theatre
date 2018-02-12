import {select} from 'redux-saga/effects'
import {StoreState} from '$lb/types'

export default function* getCurrentState(): Generator_<$FixMe, StoreState, $FixMe> {
  return yield select()
}
