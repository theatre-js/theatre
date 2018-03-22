import {select} from 'redux-saga/effects'
import {LBStoreState} from '$lb/types'

export default function* getCurrentState(): Generator_<
  $FixMe,
  LBStoreState,
  $FixMe
> {
  return yield select()
}
