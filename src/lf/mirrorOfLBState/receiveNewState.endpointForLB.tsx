import {put} from 'redux-saga/effects'
import {LBStoreState} from '$lb/types'
import {reduceStateAction} from '$shared/utils/redux/commonActions'

export default function* receiveNewState(
  state: LBStoreState,
): Generator_<'received'> {
  yield put(reduceStateAction(['mirrorOfLBState'], () => state))
  return 'received'
}
