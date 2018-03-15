import {put} from 'redux-saga/effects'
import {reduceStateAction} from '$lb/common/actions'
import {LBStoreState} from '$lb/types'

export default function* receiveNewState(
  state: LBStoreState,
): Generator_<$FixMe, 'received', $FixMe> {
  console.log('received!', state);
  
  yield put(reduceStateAction(['mirrorOfLBState'], () => state))
  return 'received'
}
